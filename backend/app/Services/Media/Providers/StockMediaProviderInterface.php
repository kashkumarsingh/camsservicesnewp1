<?php

declare(strict_types=1);

namespace App\Services\Media\Providers;

interface StockMediaProviderInterface
{
    /**
     * @param array{query:string,type:string,perPage:int,page:int} $params
     * @return array<int, array<string, mixed>>
     */
    public function search(array $params): array;

    public function providerName(): string;
}

