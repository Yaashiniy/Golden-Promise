<?php

$plantuml_text = <<<UML
@startuml
skinparam linetype ortho
skinparam BackgroundColor #FFFFFF
skinparam ArrowColor #000000
skinparam ArrowFontColor #000000

' External Entity (Colored or plain box)
skinparam RectangleBackgroundColor #FFFFFF
skinparam RectangleBorderColor #000000
skinparam RectangleFontColor #000000
skinparam RectangleFontSize 13

' Process Bubbles (Rounded boxes or circles)
skinparam UseCaseBackgroundColor #FFFFFF
skinparam UseCaseBorderColor #000000
skinparam UseCaseFontColor #000000
skinparam UseCaseFontSize 13

' External Entity
rectangle "Couple (User)" as couple

' Processes (Level 1)
usecase "1.1\\nUser Authentication" as P_auth
usecase "1.2\\nBrowse Directory" as P_browse
usecase "1.3\\nManage Budget" as P_budget
usecase "1.4\\nManage Checklist" as P_checklist
usecase "1.5\\nConsult Goldie AI" as P_ai

' Data Stores (Styled like senior's DFD data stores)
rectangle "D1 | Users Database" as D_users
rectangle "D2 | Vendors Database" as D_vendors
rectangle "D3 | Favorites Database" as D_favorites
rectangle "D4 | Budgets Database" as D_budgets
rectangle "D5 | Checklist Database" as D_checklist

' Layout alignments
couple -[hidden]right- P_auth
P_auth -[hidden]down- P_browse
P_browse -[hidden]down- P_budget
P_budget -[hidden]down- P_checklist
P_checklist -[hidden]down- P_ai

' --- 1.1 Authentication flows ---
couple --> P_auth : "Input login credentials"
D_users --> P_auth : "Retrieve user profile data"

' --- 1.2 Browse Directory flows ---
couple --> P_browse : "Input search filters"
D_vendors --> P_browse : "Retrieve vendor/venue info"
P_browse --> couple : "Show listings & WhatsApp link"
P_browse --> D_favorites : "Store bookmarked listing"
D_favorites --> P_browse : "Retrieve favorite items"

' --- 1.3 Manage Budget flows ---
couple --> P_budget : "Add/edit expense cost"
P_budget <--> D_budgets : "Retrieve & update budget details"

' --- 1.4 Manage Checklist flows ---
couple --> P_checklist : "Mark task as completed"
P_checklist <--> D_checklist : "Retrieve & update tasks"

' --- 1.5 Consult Goldie AI flows ---
couple --> P_ai : "Ask budget/tasks prompts"
P_ai --> D_budgets : "Store AI-generated budget allocation"
P_ai --> D_checklist : "Store AI-generated checklist schedule"
P_ai --> couple : "Show AI recommendations & suggestions"

@enduml
UML;

function plantuml_encode($text) {
    $compressed = gzdeflate($text, 9);
    $base64 = base64_encode($compressed);
    
    $from = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    $to   = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
    
    return strtr($base64, $from, $to);
}

$encoded = plantuml_encode($plantuml_text);
$url = "http://www.plantuml.com/plantuml/png/" . $encoded;

echo "Downloading from: " . $url . "\n";

$output_dir = "C:\\Users\\User\\.gemini\\antigravity\\brain\\f3f3a509-01b8-47ec-b4ae-b64d6aa6d415";
if (!file_exists($output_dir)) {
    mkdir($output_dir, 0777, true);
}
$output_path = $output_dir . "\\couple_dfd.png";

$img_data = file_get_contents($url);
if ($img_data === false) {
    echo "Error: Could not fetch from PlantUML server.\n";
    exit(1);
}

if (file_put_contents($output_path, $img_data) === false) {
    echo "Error: Could not save image file.\n";
    exit(1);
}

echo "Success! Saved to " . $output_path . "\n";
