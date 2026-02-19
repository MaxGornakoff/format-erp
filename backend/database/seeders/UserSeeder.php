<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('Admin123'),
            'role' => 'admin',
        ]);

        // Create manager user
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => Hash::make('Manager123'),
            'role' => 'manager',
        ]);

        // Create worker users
        User::create([
            'name' => 'Worker One',
            'email' => 'worker1@example.com',
            'password' => Hash::make('Worker123'),
            'role' => 'worker',
        ]);

        User::create([
            'name' => 'Worker Two',
            'email' => 'worker2@example.com',
            'password' => Hash::make('Worker123'),
            'role' => 'worker',
        ]);

        User::create([
            'name' => 'Worker Three',
            'email' => 'worker3@example.com',
            'password' => Hash::make('Worker123'),
            'role' => 'worker',
        ]);
    }
}
