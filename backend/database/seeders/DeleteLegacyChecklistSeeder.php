<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\User;
use Illuminate\Database\Seeder;

class DeleteLegacyChecklistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = 'parent@test.com';
        $childName = 'Test Child';

        $children = Child::where('name', $childName)
            ->whereHas('user', fn ($q) => $q->where('email', $email))
            ->get();

        foreach ($children as $child) {
            // Delete checklist if exists
            if ($child->checklist) {
                $child->checklist()->delete();
            }

            // Delete booking participants if relation exists
            if (method_exists($child, 'bookingParticipants')) {
                $child->bookingParticipants()->delete();
            }

            // Delete the child
            $child->delete();
        }

        // Delete the parent user
        User::where('email', $email)->delete();

        $this->command?->info("Deleted legacy child '$childName' and parent '$email' if they existed.");
    }
}

