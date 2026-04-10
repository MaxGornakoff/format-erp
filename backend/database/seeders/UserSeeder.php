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
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => 'Admin123',
                'role' => 'admin',
            ],
            [
                'name' => 'Manager User',
                'email' => 'manager@example.com',
                'password' => 'Manager123',
                'role' => 'manager',
            ],
            [
                'name' => 'Worker One',
                'email' => 'worker1@example.com',
                'password' => 'Worker123',
                'role' => 'worker',
            ],
            [
                'name' => 'Worker Two',
                'email' => 'worker2@example.com',
                'password' => 'Worker123',
                'role' => 'worker',
            ],
            [
                'name' => 'Worker Three',
                'email' => 'worker3@example.com',
                'password' => 'Worker123',
                'role' => 'worker',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make($user['password']),
                    'role' => $user['role'],
                ],
            );
        }
    }
}
