<?php

declare(strict_types=1);

namespace App\Services\Media;

use App\Services\Media\Providers\PexelsStockMediaProvider;
use App\Services\Media\Providers\StockMediaProviderInterface;
use App\Services\Media\Providers\UnsplashStockMediaProvider;

class StockMediaSearchService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function search(string $query, string $type, int $perPage, int $page): array
    {
        $params = [
            'query' => trim($query),
            'type' => $type,
            'perPage' => $perPage,
            'page' => $page,
        ];

        $items = [];
        foreach ($this->providersForType($type) as $provider) {
            $providerItems = $provider->search($params);
            if (!empty($providerItems)) {
                $items = array_merge($items, $providerItems);
            }
        }

        if (empty($items)) {
            return [];
        }

        return array_values(array_slice($items, 0, $perPage));
    }

    /**
     * @return array<int, StockMediaProviderInterface>
     */
    private function providersForType(string $type): array
    {
        if ($type === 'video') {
            return [app(PexelsStockMediaProvider::class)];
        }

        return [
            app(PexelsStockMediaProvider::class),
            app(UnsplashStockMediaProvider::class),
        ];
    }
}

