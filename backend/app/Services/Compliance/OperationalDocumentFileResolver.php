<?php

namespace App\Services\Compliance;

use App\Models\OperationalDocument;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Resolves operational document files for download.
 *
 * Railway and similar hosts use ephemeral disks, so uploaded copies in storage/app/private
 * can disappear after redeploy. Bundled seed sources live in the repo (storage/seeds/...)
 * and are baked into the Docker image. Optional external_url supports Google Drive or
 * other public links when no local copy exists.
 */
class OperationalDocumentFileResolver
{
    private const DISK = 'local';

    private const BUNDLED_SUBDIR = 'drive-download-20260706T144113Z-3-001';

    /**
     * @return array{kind: 'storage', path: string}|array{kind: 'bundled', path: string}|array{kind: 'external', url: string}|null
     */
    public function resolve(OperationalDocument $document): ?array
    {
        if ($document->storage_path && Storage::disk(self::DISK)->exists($document->storage_path)) {
            return ['kind' => 'storage', 'path' => $document->storage_path];
        }

        $bundled = $this->resolveBundledPath($document);
        if ($bundled !== null) {
            return ['kind' => 'bundled', 'path' => $bundled];
        }

        $externalUrl = trim((string) ($document->external_url ?? ''));
        if ($externalUrl !== '' && filter_var($externalUrl, FILTER_VALIDATE_URL)) {
            return ['kind' => 'external', 'url' => $externalUrl];
        }

        return null;
    }

    public function hasDownloadableFile(OperationalDocument $document): bool
    {
        return $this->resolve($document) !== null;
    }

    /**
     * @return StreamedResponse|BinaryFileResponse|RedirectResponse|null
     */
    public function downloadResponse(OperationalDocument $document): StreamedResponse|BinaryFileResponse|RedirectResponse|null
    {
        $resolved = $this->resolve($document);
        if ($resolved === null) {
            return null;
        }

        $fileName = $document->file_name ?: basename($document->storage_path ?? 'document');

        if ($resolved['kind'] === 'external') {
            return redirect()->away($resolved['url']);
        }

        if ($resolved['kind'] === 'storage') {
            $mime = Storage::disk(self::DISK)->mimeType($resolved['path']) ?: $document->mime_type;

            return Storage::disk(self::DISK)->response(
                $resolved['path'],
                $fileName,
                ['Content-Type' => $mime]
            );
        }

        $mime = $document->mime_type ?: $this->guessMimeType($resolved['path']);

        return response()->download($resolved['path'], $fileName, [
            'Content-Type' => $mime,
        ]);
    }

    /**
     * Locate a bundled source file shipped in the Docker image / repo.
     */
    public function resolveBundledPath(OperationalDocument $document): ?string
    {
        $candidates = array_values(array_filter(array_unique([
            $document->file_name,
            $document->slug ? $document->slug.'.docx' : null,
            $document->slug ? $document->slug.'.pdf' : null,
            $document->storage_path ? basename($document->storage_path) : null,
        ])));

        foreach ($candidates as $filename) {
            $path = $this->findBundledSourceFile($filename);
            if ($path !== null) {
                return $path;
            }
        }

        return null;
    }

    public function findBundledSourceFile(string $filename): ?string
    {
        $filename = trim($filename);
        if ($filename === '') {
            return null;
        }

        $relativePaths = [
            $filename,
            self::BUNDLED_SUBDIR.DIRECTORY_SEPARATOR.$filename,
        ];

        $roots = array_filter([
            storage_path('seeds/operational-documents/sources'),
            env('CAMS_OPERATIONAL_DOCS_PATH'),
        ]);

        foreach ($roots as $root) {
            if (! is_dir($root)) {
                continue;
            }

            foreach ($relativePaths as $relative) {
                $path = $root.DIRECTORY_SEPARATOR.$relative;
                if (is_file($path)) {
                    return $path;
                }
            }
        }

        return null;
    }

    private function guessMimeType(string $path): string
    {
        return match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            default => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
    }
}
