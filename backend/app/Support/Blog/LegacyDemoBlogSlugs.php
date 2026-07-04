<?php

namespace App\Support\Blog;

/**
 * CMS placeholder posts that must not be served publicly.
 * Marketing SEO articles live in the Next.js frontend, not in blog_posts.
 */
final class LegacyDemoBlogSlugs
{
    /** @var list<string> */
    public const EXACT = [
        'demo-blog-post-1',
        'demo-blog-post-2',
        'demo-blog-post-3',
        'demo-blog-post-4',
        'demo-blog-post-5',
        'understanding-sen-support-guide',
        'safeguarding-at-cams',
        'choosing-sen-mentor',
        'what-is-trauma-informed-care',
        'understanding-sen-support-parents-guide',
        'power-of-consistency-youth-mentoring',
        'cams-programmes-one-to-one-support-overview',
    ];

    public const PREFIX = 'demo-blog-post-';

    public const TITLE_PREFIX = 'Demo blog post';
}
