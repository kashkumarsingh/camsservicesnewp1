<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Grandfather existing users and booking participants
     * Location: backend/database/migrations/
     * 
     * This migration:
     * - Sets all existing users to 'approved' status
     * - Creates children records from existing booking_participants
     * - Links booking_participants to newly created children
     * - Sets all created children to 'approved' status
     * 
     * This ensures existing users can continue booking without disruption.
     */
    public function up(): void
    {
        // Step 1: Set all existing users to approved (grandfather existing users)
        DB::table('users')
            ->whereNull('approval_status')
            ->orWhere('approval_status', '')
            ->update([
                'approval_status' => 'approved',
                'approved_at' => now(),
            ]);

        // Step 2: Create children from unique booking_participants
        // Only for authenticated bookings (user_id is not null)
        // PostgreSQL-compatible syntax
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'pgsql') {
            // PostgreSQL syntax
            DB::statement("
                INSERT INTO children (
                    user_id, 
                    name, 
                    age, 
                    date_of_birth, 
                    approval_status, 
                    approved_at,
                    created_at, 
                    updated_at
                )
                SELECT DISTINCT
                    b.user_id,
                    CONCAT(COALESCE(bp.first_name, ''), ' ', COALESCE(bp.last_name, '')) as name,
                    COALESCE(
                        EXTRACT(YEAR FROM AGE(CURRENT_DATE, bp.date_of_birth))::integer,
                        0
                    ) as age,
                    bp.date_of_birth,
                    'approved' as approval_status,
                    NOW() as approved_at,
                    MIN(bp.created_at) as created_at,
                    NOW() as updated_at
                FROM booking_participants bp
                INNER JOIN bookings b ON bp.booking_id = b.id
                WHERE b.user_id IS NOT NULL
                    AND b.user_id > 0
                    AND bp.first_name IS NOT NULL
                    AND bp.first_name != ''
                    AND bp.last_name IS NOT NULL
                    AND bp.last_name != ''
                GROUP BY 
                    b.user_id, 
                    bp.first_name, 
                    bp.last_name, 
                    bp.date_of_birth
                HAVING COUNT(*) > 0
            ");
        } else {
            // MySQL syntax
            DB::statement("
                INSERT INTO children (
                    user_id, 
                    name, 
                    age, 
                    date_of_birth, 
                    approval_status, 
                    approved_at,
                    created_at, 
                    updated_at
                )
                SELECT DISTINCT
                    b.user_id,
                    CONCAT(COALESCE(bp.first_name, ''), ' ', COALESCE(bp.last_name, '')) as name,
                    COALESCE(
                        TIMESTAMPDIFF(YEAR, bp.date_of_birth, CURDATE()),
                        0
                    ) as age,
                    bp.date_of_birth,
                    'approved' as approval_status,
                    NOW() as approved_at,
                    MIN(bp.created_at) as created_at,
                    NOW() as updated_at
                FROM booking_participants bp
                INNER JOIN bookings b ON bp.booking_id = b.id
                WHERE b.user_id IS NOT NULL
                    AND b.user_id > 0
                    AND bp.first_name IS NOT NULL
                    AND bp.first_name != ''
                    AND bp.last_name IS NOT NULL
                    AND bp.last_name != ''
                GROUP BY 
                    b.user_id, 
                    bp.first_name, 
                    bp.last_name, 
                    bp.date_of_birth
                HAVING COUNT(*) > 0
            ");
        }

        // Step 3: Link booking_participants to newly created children
        // Match by user_id, name, and date_of_birth
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'pgsql') {
            // PostgreSQL syntax - use subquery to avoid referencing bp in JOIN
            DB::statement("
                UPDATE booking_participants bp
                SET child_id = (
                    SELECT c.id
                    FROM children c
                    INNER JOIN bookings b ON c.user_id = b.user_id
                    WHERE b.id = bp.booking_id
                        AND b.user_id IS NOT NULL
                        AND b.user_id > 0
                        AND c.name = CONCAT(COALESCE(bp.first_name, ''), ' ', COALESCE(bp.last_name, ''))
                        AND (
                            (c.date_of_birth IS NOT NULL AND bp.date_of_birth IS NOT NULL AND c.date_of_birth = bp.date_of_birth)
                            OR (c.date_of_birth IS NULL AND bp.date_of_birth IS NULL)
                        )
                    LIMIT 1
                )
                WHERE bp.child_id IS NULL
                    AND EXISTS (
                        SELECT 1
                        FROM bookings b
                        WHERE b.id = bp.booking_id
                            AND b.user_id IS NOT NULL
                            AND b.user_id > 0
                    )
            ");
        } else {
            // MySQL syntax
            DB::statement("
                UPDATE booking_participants bp
                INNER JOIN bookings b ON bp.booking_id = b.id
                INNER JOIN children c ON 
                    c.user_id = b.user_id 
                    AND c.name = CONCAT(COALESCE(bp.first_name, ''), ' ', COALESCE(bp.last_name, ''))
                    AND (
                        (c.date_of_birth IS NOT NULL AND bp.date_of_birth IS NOT NULL AND c.date_of_birth = bp.date_of_birth)
                        OR (c.date_of_birth IS NULL AND bp.date_of_birth IS NULL)
                    )
                SET bp.child_id = c.id
                WHERE b.user_id IS NOT NULL
                    AND b.user_id > 0
                    AND bp.child_id IS NULL
            ");
        }
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This is a data migration, so we can't fully reverse it.
     * We'll just remove the approval status from users.
     */
    public function down(): void
    {
        // Remove approval status (set to pending)
        DB::table('users')
            ->where('approval_status', 'approved')
            ->whereNotNull('approved_at')
            ->update([
                'approval_status' => 'pending',
                'approved_at' => null,
            ]);

        // Note: We don't delete children records as they may have been manually created
        // and linked to other records. Manual cleanup would be required.
    }
};

