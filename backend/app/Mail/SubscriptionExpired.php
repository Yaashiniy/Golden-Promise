<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Vendor;

class SubscriptionExpired extends Mailable
{
    use Queueable, SerializesModels;

    public $vendor;
    public $oldTier;

    /**
     * Create a new message instance.
     */
    public function __construct(Vendor $vendor, $oldTier)
    {
        $this->vendor = $vendor;
        $this->oldTier = $oldTier;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Golden Promise Subscription Has Expired',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription-expired',
            with: [
                'vendorName' => $this->vendor->name,
                'oldTier' => ucfirst($this->oldTier),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
