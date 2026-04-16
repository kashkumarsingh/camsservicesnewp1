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
     * Resolve map embed URL: classic (map_embed_url) or Maps Embed API (key + place_id/address).
     * Requires migration adding map_place_id, map_address to site_settings when using Embed API.
     */
    private function resolveMapEmbedUrl(\App\Models\SiteSetting $settings): ?string
    {
        if (! empty($settings->map_embed_url)) {
            return $settings->map_embed_url;
        }
        $apiKey = config('services.google_maps_embed.api_key');
        $placeId = $settings->map_place_id ?? null;
        $address = $settings->map_address ?? null;
        if (empty($apiKey) || (empty($placeId) && empty($address))) {
            return null;
        }
        $q = $placeId
            ? 'place_id:' . $placeId
            : rawurlencode((string) $address);

        return 'https://www.google.com/maps/embed/v1/place?key='
            . urlencode($apiKey)
            . '&q='
            . $q;
    }

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
                'mapEmbedUrl' => $this->resolveMapEmbedUrl($settings),
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
