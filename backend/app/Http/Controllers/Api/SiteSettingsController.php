<?php

namespace App\Http\Controllers\Api;

use App\Actions\SiteSettings\GetSiteSettingsAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Site Settings Controller (Interface Layer - API)
 * 
 * Clean Architecture Layer: Interface (API Adapter)
 * 
 * Handles HTTP requests for site settings API endpoints.
 */
class SiteSettingsController extends Controller
{
    use BaseApiController;

    public function __construct(
        private GetSiteSettingsAction $getSiteSettingsAction
    ) {
    }

    /**
     * Format site settings for API response (camelCase).
     *
     * @param \App\Models\SiteSetting $settings
     * @return array
     */
    private function formatSettingsResponse(\App\Models\SiteSetting $settings): array
    {
        return [
            'id' => (string) $settings->id,
            'contact' => [
                'phone' => $settings->phone,
                'email' => $settings->email,
                'address' => $settings->address,
                'fullAddress' => $settings->full_address,
                'whatsappUrl' => $settings->whatsapp_url,
                'mapEmbedUrl' => $settings->map_embed_url,
            ],
            'social' => [
                'links' => $settings->social_links ?? [],
            ],
            'company' => [
                'name' => $settings->company_name,
                'description' => $settings->company_description,
                'registrationNumber' => $settings->registration_number,
            ],
            'trustIndicators' => $settings->trust_indicators ?? [],
            'certifications' => [
                'ofstedRegistered' => (bool) $settings->ofsted_registered,
                'list' => $settings->certifications ?? [],
            ],
            'navigation' => [
                'links' => $settings->nav_links ?? [],
                'logoPath' => $settings->logo_path,
            ],
            'footer' => [
                'quickLinks' => $settings->quick_links ?? [],
            ],
            'support' => [
                'emails' => $settings->support_emails ?? [],
                'whatsappNumbers' => $settings->support_whatsapp_numbers ?? [],
            ],
            'packageBenefits' => $settings->package_benefits ?? [],
            'copyright' => [
                'text' => $settings->copyright_text,
            ],
            'updatedAt' => $settings->updated_at->toIso8601String(),
        ];
    }

    /**
     * Get site settings.
     *
     * GET /api/v1/site-settings
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $settings = $this->getSiteSettingsAction->execute();

        $response = $this->successResponse($this->formatSettingsResponse($settings));

        // Set ETag for cache invalidation
        $response->setEtag(md5($settings->id . $settings->updated_at->timestamp));

        return $response;
    }
}
