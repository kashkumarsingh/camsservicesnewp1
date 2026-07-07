<?php

namespace App\Console\Commands;

use App\Models\OperationalDocument;
use App\Services\Compliance\OperationalDocumentFileResolver;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SeedOperationalDocuments extends Command
{
    protected $signature = 'operational-documents:seed {--force : Replace existing records and files}';

    protected $description = 'Seed internal operational documents from CAMS Social Development Word files';

    private const DISK = 'local';

    public function __construct(
        private readonly OperationalDocumentFileResolver $documentFiles
    ) {
        parent::__construct();
    }

    /** @var array<int, array{slug: string, title: string, category: string, audience: string, version: string, source: string, published: bool}> */
    private const DOCUMENTS = [
        [
            'slug' => 'school-onboarding-pack',
            'title' => 'School Onboarding Pack',
            'category' => OperationalDocument::CATEGORY_OPERATIONS,
            'audience' => OperationalDocument::AUDIENCE_ADMIN,
            'version' => '1.0',
            'source' => 'School Onboarding Pack.docx',
            'published' => true,
        ],
        [
            'slug' => 'transport-chaperone-policy-internal',
            'title' => 'Transport and Chaperone Policy (Internal)',
            'category' => OperationalDocument::CATEGORY_TRANSPORT,
            'audience' => OperationalDocument::AUDIENCE_ALL,
            'version' => '2.0',
            'source' => 'Transport & Chaperone Policy.docx',
            'published' => true,
        ],
        [
            'slug' => 'vehicle-safety-driver-responsibilities',
            'title' => 'Vehicle Safety and Driver Responsibilities Policy',
            'category' => OperationalDocument::CATEGORY_TRANSPORT,
            'audience' => OperationalDocument::AUDIENCE_ALL,
            'version' => '2.0',
            'source' => 'Vehicle Safety & Driver Responsibilities Policy.docx',
            'published' => true,
        ],
        [
            'slug' => 'dbs-checking-management',
            'title' => 'DBS Checking and Management Procedure',
            'category' => OperationalDocument::CATEGORY_HR,
            'audience' => OperationalDocument::AUDIENCE_ADMIN,
            'version' => '2.0',
            'source' => 'DBS Checking and Management Procedure.docx',
            'published' => true,
        ],
        [
            'slug' => 'incident-reporting-procedure',
            'title' => 'Incident Reporting Procedure',
            'category' => OperationalDocument::CATEGORY_SAFEGUARDING,
            'audience' => OperationalDocument::AUDIENCE_ALL,
            'version' => '1.0',
            'source' => 'INCIDENT REPORTING PROCEDURE.docx',
            'published' => true,
        ],
        [
            'slug' => 'local-authority-data-sharing-agreement',
            'title' => 'Local Authority Data Sharing Agreement',
            'category' => OperationalDocument::CATEGORY_LEGAL,
            'audience' => OperationalDocument::AUDIENCE_ADMIN,
            'version' => '1.0',
            'source' => 'Local Authority Data Sharing Agreement.docx',
            'published' => true,
        ],
        [
            'slug' => 'lone-working-policy',
            'title' => 'Lone Working Policy',
            'category' => OperationalDocument::CATEGORY_OPERATIONS,
            'audience' => OperationalDocument::AUDIENCE_ALL,
            'version' => '2.0',
            'source' => 'Lone Working Policy.docx',
            'published' => true,
        ],
        [
            'slug' => 'pick-up-drop-off-procedure-internal',
            'title' => 'Pick Up and Drop Off Procedure (Internal)',
            'category' => OperationalDocument::CATEGORY_TRANSPORT,
            'audience' => OperationalDocument::AUDIENCE_ALL,
            'version' => '1.0',
            'source' => 'Pick Up & Drop Off Procedure.docx',
            'published' => true,
        ],
        [
            'slug' => 'safeguarding-lead-role-description',
            'title' => 'Safeguarding Lead Role Description',
            'category' => OperationalDocument::CATEGORY_SAFEGUARDING,
            'audience' => OperationalDocument::AUDIENCE_ADMIN,
            'version' => '1.0',
            'source' => 'Safeguarding Lead Role Description.docx',
            'published' => true,
        ],
        [
            'slug' => 'staff-handbook',
            'title' => 'Staff Handbook',
            'category' => OperationalDocument::CATEGORY_OPERATIONS,
            'audience' => OperationalDocument::AUDIENCE_ALL,
            'version' => '1.0',
            'source' => 'STAFF HANDBOOK.docx',
            'published' => true,
        ],
        [
            'slug' => 'staff-training-cpd-framework',
            'title' => 'Staff Training and CPD Framework',
            'category' => OperationalDocument::CATEGORY_HR,
            'audience' => OperationalDocument::AUDIENCE_ALL,
            'version' => '1.0',
            'source' => 'Staff Training and CPD Framework.docx',
            'published' => true,
        ],
        [
            'slug' => 'training-completion-record',
            'title' => 'Training Completion Record',
            'category' => OperationalDocument::CATEGORY_HR,
            'audience' => OperationalDocument::AUDIENCE_TRAINER,
            'version' => '1.0',
            'source' => 'Training Completion Record.docx',
            'published' => true,
        ],
        [
            'slug' => 'cpd-record',
            'title' => 'Continuing Professional Development (CPD) Record',
            'category' => OperationalDocument::CATEGORY_HR,
            'audience' => OperationalDocument::AUDIENCE_TRAINER,
            'version' => '1.0',
            'source' => 'Continuing Professional Development (CPD) Record.docx',
            'published' => true,
        ],
        [
            'slug' => 'health-safety-policy',
            'title' => 'Health and Safety Policy',
            'category' => OperationalDocument::CATEGORY_OPERATIONS,
            'audience' => OperationalDocument::AUDIENCE_ALL,
            'version' => '1.0',
            'source' => 'Health & Safety Policy.docx',
            'published' => true,
        ],
        [
            'slug' => 'mentor-session-report-template',
            'title' => 'Mentor Session Report Template',
            'category' => OperationalDocument::CATEGORY_OPERATIONS,
            'audience' => OperationalDocument::AUDIENCE_TRAINER,
            'version' => '1.0',
            'source' => 'Mentor Session Report Template.docx',
            'published' => true,
        ],
        [
            'slug' => 'mentor-supervision-record',
            'title' => 'Mentor Supervision Record',
            'category' => OperationalDocument::CATEGORY_SAFEGUARDING,
            'audience' => OperationalDocument::AUDIENCE_TRAINER,
            'version' => '1.0',
            'source' => 'Mentor Supervision Record.docx',
            'published' => true,
        ],
        [
            'slug' => 'performance-review-template',
            'title' => 'Performance Review Template',
            'category' => OperationalDocument::CATEGORY_HR,
            'audience' => OperationalDocument::AUDIENCE_ADMIN,
            'version' => '1.0',
            'source' => 'Performance Review Template.docx',
            'published' => true,
        ],
        [
            'slug' => 'quality-assurance-continuous-improvement',
            'title' => 'Quality Assurance and Continuous Improvement Procedure',
            'category' => OperationalDocument::CATEGORY_OPERATIONS,
            'audience' => OperationalDocument::AUDIENCE_ADMIN,
            'version' => '1.0',
            'source' => 'Quality Assurance & Continuous Improvement Procedure.docx',
            'published' => true,
        ],
        [
            'slug' => 'school-partnership-agreement',
            'title' => 'School Partnership Agreement',
            'category' => OperationalDocument::CATEGORY_LEGAL,
            'audience' => OperationalDocument::AUDIENCE_ADMIN,
            'version' => '1.0',
            'source' => 'School Partnership Agreement.docx',
            'published' => true,
        ],
        [
            'slug' => 'school-service-agreement',
            'title' => 'School Service Agreement',
            'category' => OperationalDocument::CATEGORY_LEGAL,
            'audience' => OperationalDocument::AUDIENCE_ADMIN,
            'version' => '1.0',
            'source' => 'School Service Agreement.docx',
            'published' => true,
        ],
        [
            'slug' => 'self-employed-mentor-agreement',
            'title' => 'Self-Employed Mentor Agreement',
            'category' => OperationalDocument::CATEGORY_LEGAL,
            'audience' => OperationalDocument::AUDIENCE_TRAINER,
            'version' => '1.0',
            'source' => 'SELF-EMPLOYED MENTOR AGREEMENT.docx',
            'published' => true,
        ],
    ];

    public function handle(): int
    {
        $force = (bool) $this->option('force');

        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach (self::DOCUMENTS as $definition) {
            $sourcePath = $this->documentFiles->findBundledSourceFile($definition['source']);
            if ($sourcePath === null) {
                $this->warn("Missing source file: {$definition['source']}");
                $skipped++;

                continue;
            }

            $existing = OperationalDocument::where('slug', $definition['slug'])->first();
            if ($existing && ! $force) {
                $this->line("Skipped existing: {$definition['slug']}");
                $skipped++;

                continue;
            }

            $extension = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION)) ?: 'docx';
            $storageRelative = 'operational-documents/'.$definition['slug'].'.'.$extension;
            $contents = file_get_contents($sourcePath);
            if ($contents === false) {
                $this->warn("Could not read source file: {$definition['source']}");
                $skipped++;

                continue;
            }
            Storage::disk(self::DISK)->put($storageRelative, $contents);

            $mime = match ($extension) {
                'pdf' => 'application/pdf',
                'doc' => 'application/msword',
                default => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            };

            $payload = [
                'title' => $definition['title'],
                'category' => $definition['category'],
                'audience' => $definition['audience'],
                'storage_path' => $storageRelative,
                'file_name' => $definition['source'],
                'mime_type' => $mime,
                'version' => $definition['version'],
                'is_published' => $definition['published'],
                'internal_only' => true,
            ];

            if ($existing) {
                if ($existing->storage_path !== $storageRelative && Storage::disk(self::DISK)->exists($existing->storage_path)) {
                    Storage::disk(self::DISK)->delete($existing->storage_path);
                }
                $existing->fill($payload);
                $existing->save();
                $updated++;
                $this->info("Updated: {$definition['slug']}");

                continue;
            }

            OperationalDocument::create(array_merge($payload, [
                'slug' => $definition['slug'],
            ]));
            $created++;
            $this->info("Created: {$definition['slug']}");
        }

        $this->newLine();
        $this->info("Operational documents seeded (created: {$created}, updated: {$updated}, skipped: {$skipped}).");

        return self::SUCCESS;
    }
}
