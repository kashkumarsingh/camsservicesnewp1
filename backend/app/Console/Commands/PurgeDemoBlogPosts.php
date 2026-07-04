<?php

namespace App\Console\Commands;

use App\Services\Blog\PurgeLegacyDemoBlogPosts;
use Illuminate\Console\Command;

class PurgeDemoBlogPosts extends Command
{
    protected $signature = 'blog:purge-demo-posts {--force : Skip confirmation}';

    protected $description = 'Permanently delete legacy demo and thin CMS blog posts from the database';

    public function handle(PurgeLegacyDemoBlogPosts $purge): int
    {
        if (! $this->option('force') && ! $this->confirm('Delete all legacy demo CMS blog posts?', false)) {
            $this->info('Cancelled.');

            return self::SUCCESS;
        }

        $deleted = $purge->execute();

        if ($deleted->isEmpty()) {
            $this->info('No legacy demo blog posts found.');

            return self::SUCCESS;
        }

        $this->info('Deleted '.$deleted->count().' blog post(s):');
        $deleted->each(fn (string $slug) => $this->line("  - {$slug}"));

        return self::SUCCESS;
    }
}
