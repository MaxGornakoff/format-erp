<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityLogger
{
    public static function log(
        ?User $actor,
        string $action,
        ?Request $request = null,
        ?string $subjectType = null,
        ?int $subjectId = null,
        ?string $description = null,
        array $metadata = [],
        bool $force = false,
    ): void {
        if (! $actor) {
            return;
        }

        if (! $force && ! $actor->is_tracked) {
            return;
        }

        $ipAddress = $request?->ip();

        $userAgent = (string) ($request?->userAgent() ?? '');

        if ($ipAddress) {
            $metadata['ip'] = $ipAddress;
        }

        if ($userAgent !== '') {
            $metadata['browser'] = self::detectBrowser($userAgent);
            $metadata['device'] = self::detectDevice($userAgent);
        }

        ActivityLog::create([
            'user_id' => $actor->id,
            'user_name' => $actor->name,
            'user_email' => $actor->email,
            'user_role' => $actor->role,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'description' => $description,
            'metadata' => empty($metadata) ? null : $metadata,
            'ip_address' => $ipAddress,
            'user_agent' => Str::limit($userAgent, 1000, ''),
        ]);
    }

    private static function detectBrowser(string $userAgent): string
    {
        $normalized = Str::lower($userAgent);

        return match (true) {
            str_contains($normalized, 'edg/') => 'Microsoft Edge',
            str_contains($normalized, 'opr/'), str_contains($normalized, 'opera') => 'Opera',
            str_contains($normalized, 'chrome/') && ! str_contains($normalized, 'edg/') => 'Google Chrome',
            str_contains($normalized, 'firefox/') => 'Mozilla Firefox',
            str_contains($normalized, 'safari/') && ! str_contains($normalized, 'chrome/') => 'Safari',
            default => 'Unknown browser',
        };
    }

    private static function detectDevice(string $userAgent): string
    {
        $normalized = Str::lower($userAgent);

        return match (true) {
            str_contains($normalized, 'iphone') => 'iPhone',
            str_contains($normalized, 'ipad') => 'iPad',
            str_contains($normalized, 'android') && str_contains($normalized, 'mobile') => 'Android phone',
            str_contains($normalized, 'android') => 'Android tablet',
            str_contains($normalized, 'windows') => 'Windows PC',
            str_contains($normalized, 'macintosh'), str_contains($normalized, 'mac os') => 'Mac',
            str_contains($normalized, 'linux') => 'Linux PC',
            default => 'Unknown device',
        };
    }
}
