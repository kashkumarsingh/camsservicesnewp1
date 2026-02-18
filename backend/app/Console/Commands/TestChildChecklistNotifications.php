<?php

namespace App\Console\Commands;

use App\Models\Child;
use App\Models\ChildChecklist;
use App\Models\User;
use App\Notifications\AdminChildChecklistSubmittedNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

/**
 * Test Child Checklist Notifications Command
 * 
 * Purpose: Test admin notifications for child checklist submissions
 * Usage: php artisan test:child-checklist-notifications
 */
class TestChildChecklistNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:child-checklist-notifications {--child-id= : Specific child ID to test}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test admin notifications for child checklist submissions';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🧪 Testing Child Checklist Admin Notifications...');
        $this->newLine();

        // Get child
        if ($this->option('child-id')) {
            $child = Child::with(['user', 'checklist'])->find($this->option('child-id'));
            if (!$child) {
                $this->error('❌ Child not found with ID: ' . $this->option('child-id'));
                return self::FAILURE;
            }
        } else {
            $child = Child::with(['user', 'checklist'])->whereHas('checklist')->first();
            if (!$child) {
                $this->error('❌ No children with checklists found in database.');
                return self::FAILURE;
            }
        }

        // Get checklist
        $checklist = $child->checklist;
        if (!$checklist) {
            $this->error('❌ Child does not have a checklist.');
            return self::FAILURE;
        }

        $this->info('👶 Child: ' . $child->name);
        $this->info('👨‍👩‍👧 Parent: ' . $child->user->name . ' (' . $child->user->email . ')');
        $this->newLine();

        // Get all admin users
        $admins = User::where('role', 'admin')->get();
        
        if ($admins->isEmpty()) {
            $this->warn('⚠️  No admin users found in database.');
            $this->info('💡 Creating test notification route for testing...');
            
            // Test with notification route instead
            $testEmail = $this->ask('Enter email address to send test notification', 'admin@camsservice.co.uk');
            
            try {
                Notification::route('mail', $testEmail)
                    ->notify(new AdminChildChecklistSubmittedNotification($child, $checklist));
                
                $this->newLine();
                $this->info('✅ Test notification sent to: ' . $testEmail);
                $this->info('📧 Check your email inbox (or MailHog at http://localhost:8025)');
                
                return self::SUCCESS;
            } catch (\Exception $e) {
                $this->error('❌ Failed to send notification: ' . $e->getMessage());
                return self::FAILURE;
            }
        }

        // Send to all admins
        $this->info('📤 Sending notifications to ' . $admins->count() . ' admin(s)...');
        $this->newLine();

        $successCount = 0;
        $failCount = 0;

        foreach ($admins as $admin) {
            try {
                $admin->notify(new AdminChildChecklistSubmittedNotification($child, $checklist));
                $this->line('  ✅ Sent to: ' . $admin->email . ' (' . $admin->name . ')');
                $successCount++;
            } catch (\Exception $e) {
                $this->line('  ❌ Failed for: ' . $admin->email . ' - ' . $e->getMessage());
                $failCount++;
            }
        }

        $this->newLine();
        $this->info("📊 Results: {$successCount} sent, {$failCount} failed");
        $this->info('📧 Check MailHog at http://localhost:8025 to view emails');

        return $failCount > 0 ? self::FAILURE : self::SUCCESS;
    }
}
