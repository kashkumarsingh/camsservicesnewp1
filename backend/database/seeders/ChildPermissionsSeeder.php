<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ChildPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissions = [
            'children.view',
            'children.create',
            'children.update',
            'children.delete',
            'children.archive',
            'children.restore',
            'children.force-delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'super_admin']);
        $adminRole->syncPermissions($permissions);

        $parentRole = Role::firstOrCreate(['name' => 'parent']);
        $parentRole->syncPermissions([
            'children.view',
            'children.create',
            'children.update',
            'children.delete',
            'children.archive',
        ]);
    }
}
