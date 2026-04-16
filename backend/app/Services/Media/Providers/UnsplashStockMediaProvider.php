<?php

declare(strict_types=1);

namespace App\Services\Media\Providers;

use Illuminate\Support\Facades\Http;

class UnsplashStockMediaProvider implements StockMediaProviderInterface
{
    public function providerName(): string
    {
        return 'unsplash';
    }

    /**
     * @param array{query:string,type:string,perPage:int,page:int} $params
     * @return array<int, array<string, mixed>>
     */
    public function search(array $params): array
    {
        if ($params['type'] !== 'image') {
            return [];
        }

        $apiKey = (string) config('services.unsplash.access_key');
        if ($apiKey === '') {
            return [];
        }

        $baseUri = rtrim((string) config('services.unsplash.base_uri', 'https://api.unsplash.com'), '/');
        $response = Http::acceptJson()
            ->withHeaders([
                'Authorization' => 'Client-ID '.$apiKey,
                'Accept-Version' => 'v1',
            ])
            ->get($baseUri.'/search/photos', [
                'query' => $params['query'],
                'per_page' => $params['perPage'],
                'page' => $params['page'],
                'orientation' => 'landscape',
            ]);

        if ($response->failed()) {
            return [];
        }

        $photos = $response->json('results', []);
        if (!is_array($photos)) {
            return [];
        }

        return collect($photos)->map(function (array $photo): array {
            return [
                'provider' => $this->providerName(),
                'type' => 'image',
                'remoteId' => (string) ($photo['id'] ?? ''),
                'title' => (string) ($photo['alt_description'] ?? 'Unsplash image'),
                'description' => (string) ($photo['description'] ?? ''),
                'url' => (string) ($photo['urls']['regular'] ?? ''),
                'thumbnailUrl' => (string) ($photo['urls']['small'] ?? ''),
                'width' => (int) ($photo['width'] ?? 0),
                'height' => (int) ($photo['height'] ?? 0),
                'durationSeconds' => null,
                'authorName' => (string) ($photo['user']['name'] ?? 'Unsplash'),
                'authorUrl' => (string) ($photo['user']['links']['html'] ?? ''),
                'sourcePageUrl' => (string) ($photo['links']['html'] ?? ''),
            ];
        })->filter(fn (array $item): bool => $item['url'] !== '')->values()->all();
    }
}

