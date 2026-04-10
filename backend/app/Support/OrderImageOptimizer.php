<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrderImageOptimizer
{
    private const THUMBNAIL_MAX_WIDTH = 900;
    private const THUMBNAIL_MAX_HEIGHT = 900;
    private const WEBP_QUALITY = 82;
    private const JPEG_QUALITY = 84;

    public function createThumbnail(UploadedFile $uploadedImage, int $orderId, string $disk = 'public'): ?string
    {
        if (! $this->canGenerateThumbnails()) {
            return null;
        }

        $sourcePath = $uploadedImage->getRealPath();

        if (! $sourcePath || ! is_file($sourcePath)) {
            return null;
        }

        $imageInfo = @getimagesize($sourcePath);

        if (! is_array($imageInfo)) {
            return null;
        }

        [$width, $height, $imageType] = $imageInfo;

        if (! $width || ! $height) {
            return null;
        }

        $sourceImage = $this->createSourceImage($sourcePath, (int) $imageType);

        if (! $sourceImage) {
            return null;
        }

        [$targetWidth, $targetHeight] = $this->calculateTargetSize((int) $width, (int) $height);

        $thumbnail = imagecreatetruecolor($targetWidth, $targetHeight);

        if (! $thumbnail) {
            imagedestroy($sourceImage);
            return null;
        }

        imagealphablending($thumbnail, false);
        imagesavealpha($thumbnail, true);
        $transparent = imagecolorallocatealpha($thumbnail, 0, 0, 0, 127);
        imagefill($thumbnail, 0, 0, $transparent);

        imagecopyresampled($thumbnail, $sourceImage, 0, 0, 0, 0, $targetWidth, $targetHeight, (int) $width, (int) $height);

        $relativePath = $this->storeThumbnailImage($thumbnail, $orderId, $disk);

        imagedestroy($thumbnail);
        imagedestroy($sourceImage);

        return $relativePath;
    }

    private function canGenerateThumbnails(): bool
    {
        return function_exists('imagecreatetruecolor') && function_exists('getimagesize');
    }

    private function createSourceImage(string $sourcePath, int $imageType)
    {
        return match ($imageType) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($sourcePath),
            IMAGETYPE_PNG => @imagecreatefrompng($sourcePath),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($sourcePath) : null,
            default => null,
        };
    }

    private function calculateTargetSize(int $width, int $height): array
    {
        $ratio = min(
            self::THUMBNAIL_MAX_WIDTH / $width,
            self::THUMBNAIL_MAX_HEIGHT / $height,
            1,
        );

        return [
            max(1, (int) round($width * $ratio)),
            max(1, (int) round($height * $ratio)),
        ];
    }

    private function storeThumbnailImage($thumbnail, int $orderId, string $disk): ?string
    {
        $extension = function_exists('imagewebp') ? 'webp' : 'jpg';
        $tempPath = tempnam(sys_get_temp_dir(), 'order-thumb-');

        if ($tempPath === false) {
            return null;
        }

        $generated = $extension === 'webp'
            ? imagewebp($thumbnail, $tempPath, self::WEBP_QUALITY)
            : imagejpeg($thumbnail, $tempPath, self::JPEG_QUALITY);

        if (! $generated) {
            @unlink($tempPath);
            return null;
        }

        $relativePath = sprintf('orders/%d/thumbnails/%s.%s', $orderId, (string) Str::uuid(), $extension);
        Storage::disk($disk)->put($relativePath, file_get_contents($tempPath) ?: '');
        @unlink($tempPath);

        return $relativePath;
    }
}
