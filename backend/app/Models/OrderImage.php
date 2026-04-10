<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class OrderImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'disk',
        'path',
        'thumbnail_path',
        'original_name',
        'mime_type',
        'size',
        'sort_order',
    ];

    protected $casts = [
        'size' => 'integer',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'url',
        'thumbnail_url',
    ];

    protected $hidden = [
        'disk',
        'path',
        'thumbnail_path',
        'updated_at',
    ];

    protected static function booted(): void
    {
        static::deleted(function (OrderImage $image) {
            $filesToDelete = array_filter([
                $image->path,
                $image->thumbnail_path,
            ]);

            foreach ($filesToDelete as $filePath) {
                Storage::disk($image->disk ?: 'public')->delete($filePath);
            }
        });
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->buildPublicUrl($this->path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->buildPublicUrl($this->thumbnail_path ?: $this->path);
    }

    private function buildPublicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $relativeUrl = Storage::disk($this->disk ?: 'public')->url($path);

        return str_starts_with($relativeUrl, 'http://') || str_starts_with($relativeUrl, 'https://')
            ? $relativeUrl
            : url($relativeUrl);
    }
}
