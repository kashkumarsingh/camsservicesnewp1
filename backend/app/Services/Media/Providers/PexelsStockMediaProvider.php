<?php

declare(strict_types=1);

namespace App\Services\Media\Providers;

use Illuminate\Support\Facades\Http;

class PexelsStockMediaProvider implements StockMediaProviderInterface
{
    public function providerName(): string
    {
        return 'pexels';
    }

    /**
     * @param array{query:string,type:string,perPage:int,page:int} $params
     * @return array<int, array<string, mixed>>
     */
    public function search(array $params): array
    {
        $apiKey = (string) config('services.pexels.api_key');
        if ($apiKey === '') {
            return [];
        }

        $baseUri = rtrim((string) config('services.pexels.base_uri', 'https://api.pexels.com'), '/');
        $query = $params['query'];
        $perPage = $params['perPage'];
        $page = $params['page'];
        $type = $params['type'];

        if ($type === 'video') {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->get($baseUri.'/videos/search', [
                    'query' => $query,
                    'per_page' => $perPage,
                    'page' => $page,
                ]);

            if ($response->failed()) {
                return [];
            }

            $videos = $response->json('videos', []);
            if (!is_array($videos)) {
                return [];
            }

            return collect($videos)->map(function (array $video): array {
                $videoFiles = is_array($video['video_files'] ?? null) ? $video['video_files'] : [];
                $bestFile = collect($videoFiles)
                    ->sortByDesc(fn (array $file) => (int) ($file['width'] ?? 0))
                    ->first();

                return [
                    'provider' => $this->providerName(),
                    'type' => 'video',
                    'remoteId' => (string) ($video['id'] ?? ''),
                    'title' => (string) ($video['url'] ?? 'Pexels video'),
                    'description' => null,
                    'url' => is_array($bestFile) ? (string) ($bestFile['link'] ?? '') : '',
                    'thumbnailUrl' => (string) ($video['image'] ?? ''),
                    'width' => (int) ($video['width'] ?? 0),
                    'height' => (int) ($video['height'] ?? 0),
                    'durationSeconds' => (int) ($video['duration'] ?? 0),
                    'authorName' => (string) ($video['user']['name'] ?? 'Pexels'),
                    'authorUrl' => (string) ($video['user']['url'] ?? ''),
                    'sourcePageUrl' => (string) ($video['url'] ?? ''),
                ];
            })->filter(fn (array $item): bool => $item['url'] !== '')->values()->all();
        }

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->get($baseUri.'/v1/search', [
                'query' => $query,
                'per_page' => $perPage,
                'page' => $page,
            ]);

        if ($response->failed()) {
            return [];
        }

        $photos = $response->json('photos', []);
        if (!is_array($photos)) {
            return [];
        }

        return collect($photos)->map(function (array $photo): array {
            return [
                'provider' => $this->providerName(),
                'type' => 'image',
                'remoteId' => (string) ($photo['id'] ?? ''),
                'title' => (string) ($photo['alt'] ?? 'Pexels image'),
                'description' => null,
                'url' => (string) ($photo['src']['large2x'] ?? ''),
                'thumbnailUrl' => (string) ($photo['src']['medium'] ?? ''),
                'width' => (int) ($photo['width'] ?? 0),
                'height' => (int) ($photo['height'] ?? 0),
                'durationSeconds' => null,
                'authorName' => (string) ($photo['photographer'] ?? 'Pexels'),
                'authorUrl' => (string) ($photo['photographer_url'] ?? ''),
                'sourcePageUrl' => (string) ($photo['url'] ?? ''),
            ];
        })->filter(fn (array $item): bool => $item['url'] !== '')->values()->all();
    }
}

