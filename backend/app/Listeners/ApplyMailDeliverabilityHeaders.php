<?php

namespace App\Listeners;

use Illuminate\Mail\Events\MessageSending;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

/**
 * Applies headers that improve inbox placement (Reply-To, Message-ID domain, etc.).
 */
class ApplyMailDeliverabilityHeaders
{
    public function handle(MessageSending $event): void
    {
        $message = $event->message;
        if (! $message instanceof Email) {
            return;
        }

        $fromAddress = config('mail.from.address');
        $fromName = config('mail.from.name', 'CAMS Services');
        $replyTo = env('MAIL_REPLY_TO') ?: $fromAddress;

        if (filled($replyTo)) {
            $message->replyTo(new Address($replyTo, $fromName ?: ''));
        }

        // Prefer authenticated domain in Message-ID (avoid localhost / generic IDs).
        $domain = config('mail.mailers.smtp.local_domain') ?: 'camsservices.co.uk';
        $headers = $message->getHeaders();
        if ($headers->has('Message-ID')) {
            $headers->remove('Message-ID');
        }
        $headers->addIdHeader('Message-ID', bin2hex(random_bytes(16)) . '@' . $domain);

        // Transactional mail — do not mark as bulk/list mail.
        if ($headers->has('Precedence')) {
            $headers->remove('Precedence');
        }
        if ($headers->has('List-Unsubscribe')) {
            $headers->remove('List-Unsubscribe');
        }
    }
}
