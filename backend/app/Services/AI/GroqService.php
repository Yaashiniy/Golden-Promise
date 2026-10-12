<?php
 
namespace App\Services\AI;
 
use Illuminate\Support\Facades\Http;
use RuntimeException;
 
/**
 * Unified AI service resolving client headers to call Gemini, Groq, or OpenAI.
 * Defaults to the server's Groq key configuration.
 */
class GroqService
{
    public function isConfigured(): bool
    {
        $userKey = request()->header('X-User-AI-Key');
        return !empty($userKey) || !empty(config('ai.groq.key'));
    }
 
    /**
     * Send a chat completion and return the parsed JSON content.
     */
    public function jsonCompletion(string $system, string $user): array
    {
        $messages = [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ];
        return $this->chatCompletion($messages, json: true);
    }
 
    /**
     * General chat completion with a list of messages.
     *
     * @param  array  $messages  Array of ['role'=>..., 'content'=>...]
     * @param  bool   $json      Force JSON response mode (default true)
     * @return array|string      Decoded JSON if $json, else raw string
     */
    public function chatCompletion(array $messages, bool $json = true)
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('AI key is missing. Please add a valid API key in settings or .env.');
        }

        $userProvider = request()->header('X-User-AI-Provider');
        $userKey = request()->header('X-User-AI-Key');
        $userModel = request()->header('X-User-AI-Model');

        $provider = strtolower($userProvider ?: 'groq');
        
        $key = is_string($userKey) ? trim($userKey) : null;
        if ($key === 'null' || $key === 'undefined' || $key === '') {
            $key = null;
        }

        $model = is_string($userModel) ? trim($userModel) : null;
        if ($model === 'null' || $model === 'undefined' || $model === '') {
            $model = null;
        }

        $isCustomKey = true;

        // If provider is default, or no key provided for groq, fallback to server key
        if (!$key) {
            if ($userProvider !== 'default' && $userProvider !== '') {
                throw new RuntimeException("API Key is required for {$userProvider}. Please enter it in the AI Settings.");
            }
            $provider = 'groq';
            $key = config('ai.groq.key');
            $isCustomKey = false;
        }

        \Illuminate\Support\Facades\Log::info("AI Call Resolved: Provider=[{$provider}], HeaderKey=[{$userKey}], FinalKey=[{$key}]");

        try {
            if (in_array($provider, ['gemini', 'gemini-pro', 'gemini-flash'])) {
                $modelName = ($provider === 'gemini-flash') ? 'gemini-flash-latest' : 'gemini-pro-latest';
                return $this->callGemini($key, $modelName, $messages, $json);
            } elseif ($provider === 'openai') {
                return $this->callOpenAI($key, $messages, $json);
            } elseif ($provider === 'ilmu') {
                return $this->callIlmu($key, $model, $messages, $json);
            } else {
                return $this->callGroq($key, $messages, $json);
            }
        } catch (RuntimeException $e) {
            // If the user's custom key is invalid/expired, automatically fallback to the server's built-in key
            $error = strtolower($e->getMessage());
            if ($isCustomKey && (str_contains($error, 'invalid') || str_contains($error, 'unauthorized') || str_contains($error, 'key'))) {
                \Illuminate\Support\Facades\Log::warning("Custom AI Key failed, falling back to server key. Error: " . $e->getMessage());
                return $this->callGroq(config('ai.groq.key'), $messages, $json);
            }
            throw $e;
        }
    }

    /**
     * Execute completions call against Google Gemini API.
     */
    private function callGemini(string $key, string $model, array $messages, bool $json)
    {
        $systemTexts = [];
        $contents = [];

        foreach ($messages as $msg) {
            $role = $msg['role'] ?? 'user';
            $content = $msg['content'] ?? '';

            if ($role === 'system') {
                $systemTexts[] = $content;
            } else {
                $geminiRole = ($role === 'assistant' || $role === 'model') ? 'model' : 'user';
                $contents[] = [
                    'role' => $geminiRole,
                    'parts' => [['text' => $content]]
                ];
            }
        }

        $systemInstruction = null;
        if (!empty($systemTexts)) {
            $systemInstruction = [
                'parts' => [['text' => implode("\n\n", $systemTexts)]]
            ];
        }

        $payload = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.5,
                'maxOutputTokens' => 2000,
            ]
        ];

        if ($systemInstruction) {
            $payload['systemInstruction'] = $systemInstruction;
        }

        if ($json) {
            $payload['generationConfig']['responseMimeType'] = 'application/json';
        }

        $response = Http::timeout(45)
            ->acceptJson()
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $key, $payload);

        if ($response->failed()) {
            $status = $response->status();
            if ($status === 429) {
                throw new RuntimeException('Free tier rate limit hit (429). Gemini Pro allows 2 requests per minute. Please wait a moment, or switch to Gemini Flash (Faster) in settings, which supports 15 requests per minute!');
            }
            throw new RuntimeException(
                'Gemini request failed: ' . ($response->json('error.message') ?? $response->status())
            );
        }

        $content = $response->json('candidates.0.content.parts.0.text');
        \Illuminate\Support\Facades\Log::info("GEMINI_RAW_RESPONSE: " . $content);
        if (!$json) return $content;

        $decoded = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('Gemini returned invalid JSON structure.');
        }

        return $decoded;
    }

    /**
     * Execute completions call against OpenAI API.
     */
    private function callOpenAI(string $key, array $messages, bool $json)
    {
        $payload = [
            'model' => 'gpt-4o-mini',
            'temperature' => 0.5,
            'max_tokens' => 2000,
            'messages' => $messages,
        ];

        if ($json) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        $response = Http::withToken($key)
            ->timeout(45)
            ->acceptJson()
            ->post('https://api.openai.com/v1/chat/completions', $payload);

        if ($response->failed()) {
            throw new RuntimeException(
                'OpenAI request failed: ' . ($response->json('error.message') ?? $response->status())
            );
        }

        $content = $response->json('choices.0.message.content');
        if (!$json) return $content;

        $decoded = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('OpenAI returned invalid JSON.');
        }

        return $decoded;
    }

    /**
     * Execute completions call against Malaysia's ILMU API (OpenAI compatible).
     */
    private function callIlmu(string $key, ?string $modelString, array $messages, bool $json)
    {
        // Auto-detect the model if not explicitly provided or if it's just 'ilmu'
        if (!$modelString || strtolower($modelString) === 'ilmu') {
            $modelString = \Illuminate\Support\Facades\Cache::remember('ilmu_model_' . md5($key), 3600, function () use ($key) {
                try {
                    $res = \Illuminate\Support\Facades\Http::withToken($key)->timeout(10)->get('https://api.ilmu.ai/v1/models');
                    if ($res->successful()) {
                        $data = $res->json('data');
                        if (is_array($data) && count($data) > 0) {
                            return $data[0]['id'] ?? 'ilmu';
                        }
                    }
                } catch (\Exception $e) {
                    // Ignore and fallback
                }
                return 'ilmu';
            });
        }

        $payload = [
            'model' => $modelString,
            'temperature' => 0.5,
            'max_tokens' => 2000,
            'messages' => $messages,
        ];

        if ($json) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        $response = \Illuminate\Support\Facades\Http::withToken($key)
            ->timeout(45)
            ->acceptJson()
            ->post('https://api.ilmu.ai/v1/chat/completions', $payload);

        if ($response->failed()) {
            throw new \RuntimeException(
                'ILMU request failed: ' . ($response->json('error.message') ?? $response->status())
            );
        }

        $content = $response->json('choices.0.message.content');
        if (!$json) return $content;

        $decoded = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException('ILMU returned invalid JSON.');
        }

        return $decoded;
    }

    /**
     * Execute completions call against Groq API.
     */
    private function callGroq(string $key, array $messages, bool $json)
    {
        $payload = [
            'model' => config('ai.groq.model'),
            'temperature' => 0.5,
            'max_tokens' => 2000,
            'messages' => $messages,
        ];

        if ($json) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        $response = Http::withToken($key)
            ->timeout(45)
            ->acceptJson()
            ->post(config('ai.groq.base_url') . '/chat/completions', $payload);

        if ($response->failed()) {
            throw new RuntimeException(
                'Groq request failed: ' . ($response->json('error.message') ?? $response->status())
            );
        }

        $content = $response->json('choices.0.message.content');
        if (!$json) return $content;

        $decoded = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('Groq returned invalid JSON.');
        }

        return $decoded;
    }
}
