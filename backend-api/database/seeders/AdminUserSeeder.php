<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default admin user
        User::create([
            'name' => 'Admin SIGAP',
            'email' => 'admin@sigap.ac.id',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Create default regular user for testing
        User::create([
            'name' => 'User Test',
            'email' => 'user@sigap.ac.id',
            'password' => Hash::make('user123'),
            'role' => 'user',
        ]);

        echo "✅ Admin user created: admin@sigap.ac.id / admin123\n";
        echo "✅ Test user created: user@sigap.ac.id / user123\n";
    }
}
