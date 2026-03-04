# Test Email Notifications

Send test emails for all notification types to verify your mail configuration (e.g. Mailtrap, SMTP, or production mailer).

## Send test emails to info@camsservices.co.uk

**From project root (using Docker):**

```bash
docker compose exec backend php /var/www/html/artisan test:notifications info@camsservices.co.uk
```

**From backend directory (native PHP):**

```bash
cd backend
php artisan test:notifications info@camsservices.co.uk
```

This sends **12 test emails** to `info@camsservices.co.uk` for:

1. Child Approved  
2. Child Rejected  
3. User Approved  
4. User Rejected  
5. Booking Confirmation  
6. Booking Cancellation  
7. Payment Confirmation  
8. Payment Failed  
9. Activity Confirmation  
10. (Skipped: Trainer Session Booked – requires trainer)  
11. (Skipped: Trainer Session Cancelled – requires trainer)  
12. Admin New Booking  
13. Admin Payment Received  
14. Admin Child Approval Required  
15. (Skipped: Admin Session Needs Trainer)  
16. Contact Form Submission  

## Other useful commands

- **Check mail config and support emails:**  
  `php artisan check:email-config`  
  (or `docker compose exec backend php /var/www/html/artisan check:email-config`)

- **Quick Mailtrap-style test (direct + contact submission):**  
  `php artisan test:mailtrap`  
  (Uses support emails from Site Settings, or falls back to test@example.com)

- **Run queue worker** (if notifications are queued):  
  `php artisan queue:work`

## Requirements

- `.env` must have valid `MAIL_*` settings (e.g. Mailtrap SMTP or your SMTP server).
- If using queues, run `php artisan queue:work` so queued notifications are sent.
- For Mailtrap: check the inbox at https://mailtrap.io/inboxes.
