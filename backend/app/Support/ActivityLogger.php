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
            'ip_address' => $request?->ip(),
            'user_agent' => Str::limit((string) ($request?->userAgent() ?? ''), 1000, ''),
        ]);
    }
}
