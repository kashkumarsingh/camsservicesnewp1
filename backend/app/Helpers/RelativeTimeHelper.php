<?php

namespace App\Helpers;

use Carbon\Carbon;

/**
 * Human‑friendly relative time labels for notifications and activity (British English).
 * Returns: "just now", "yesterday", "2 days ago", "1 week ago", etc.
 */
final class RelativeTimeHelper
{
    public static function label(\DateTimeInterface|Carbon|string $date): string
    {
        $dt = $date instanceof Carbon ? $date : Carbon::parse($date);
        $now = Carbon::now();
        $diffSeconds = $now->diffInSeconds($dt, false);
        $diffMinutes = (int) floor(abs($diffSeconds) / 60);
        $diffHours = (int) floor(abs($diffSeconds) / 3600);
        $diffDays = (int) $now->diffInDays($dt, false);
        $diffWeeks = (int) floor(abs($diffDays) / 7);

        if ($diffSeconds >= -60 && $diffSeconds <= 60) {
            return 'just now';
        }
        if ($diffSeconds > 0 && $diffSeconds < 3600) {
            return $diffMinutes === 1 ? '1 minute ago' : $diffMinutes . ' minutes ago';
        }
        if ($diffSeconds <= -60 && $diffSeconds > -3600) {
            return $diffMinutes === 1 ? 'in 1 minute' : 'in ' . $diffMinutes . ' minutes';
        }
        if ($diffHours > 0 && $diffHours < 24) {
            return $diffHours === 1 ? '1 hour ago' : $diffHours . ' hours ago';
        }
        if ($diffHours < 0 && $diffHours > -24) {
            return $diffHours === -1 ? 'in 1 hour' : 'in ' . abs($diffHours) . ' hours';
        }
        if ($diffDays === 0) {
            return 'today';
        }
        if ($diffDays === 1) {
            return 'yesterday';
        }
        if ($diffDays === -1) {
            return 'tomorrow';
        }
        if ($diffDays > 1 && $diffDays < 7) {
            return $diffDays . ' days ago';
        }
        if ($diffDays < -1 && $diffDays > -7) {
            return 'in ' . abs($diffDays) . ' days';
        }
        if ($diffWeeks >= 1 && $diffWeeks < 2) {
            return '1 week ago';
        }
        if ($diffWeeks >= 2 && $diffWeeks < 5) {
            return $diffWeeks . ' weeks ago';
        }
        if ($diffDays >= 7 && $diffDays < 14) {
            return '1 week ago';
        }
        if ($diffDays >= 14 && $diffDays < 30) {
            $weeks = (int) floor($diffDays / 7);
            return $weeks . ' weeks ago';
        }
        if ($diffDays >= 30 && $diffDays < 60) {
            return '1 month ago';
        }
        if ($diffDays >= 60 && $diffDays < 365) {
            $months = (int) floor($diffDays / 30);
            return $months . ' months ago';
        }
        if ($diffDays >= 365) {
            $years = (int) floor($diffDays / 365);
            return $years === 1 ? '1 year ago' : $years . ' years ago';
        }

        return $dt->format('j M Y');
    }
}
