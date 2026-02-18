@props([
    'title' => 'CAMS Services',
    'preview' => null,
])

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    @if ($preview)
        <style>body::before{content:"{{ $preview }}";display:none;}</style>
    @endif
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 15px 35px rgba(15,23,42,0.1);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#0f172a,#1d4ed8);padding:32px;text-align:center;">
                            @php
                                // Get logo URL from SiteSettings or use fallback
                                $logoUrl = null;
                                try {
                                    $settings = \App\Models\SiteSetting::instance();
                                    $logoPath = $settings->logo_path ?? null;
                                    
                                    if ($logoPath) {
                                        // If it's already a full URL, use it
                                        if (str_starts_with($logoPath, 'http://') || str_starts_with($logoPath, 'https://')) {
                                            $logoUrl = $logoPath;
                                        } else {
                                            // Extract filename and build URL
                                            $filename = basename($logoPath);
                                            $filename = str_replace(['storage/app/logos/', 'logos/', 'storage/app/', 'app/'], '', $filename);
                                            $filename = trim($filename, '/');
                                            
                                            // Check if file exists
                                            $filePath = storage_path('app/logos/' . $filename);
                                            if (file_exists($filePath)) {
                                                $logoUrl = config('app.url') . '/storage/logos/' . $filename;
                                            }
                                        }
                                    }
                                } catch (\Exception $e) {
                                    // Fallback to default if SiteSettings unavailable
                                }
                            @endphp
                            @if($logoUrl)
                                <img src="{{ $logoUrl }}" alt="CAMS Services" style="height:32px;display:block;margin:0 auto 12px auto;max-width:200px;">
                            @else
                                <div style="height:32px;margin:0 auto 12px auto;display:flex;align-items:center;justify-content:center;">
                                    <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.05em;">CAMS</span>
                                </div>
                            @endif
                            <p style="margin:0;color:#cbd5f5;font-size:14px;letter-spacing:0.1em;text-transform:uppercase;">CAMS Services</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            {{ $slot }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px;background-color:#0f172a;color:#cbd5f5;font-size:13px;text-align:center;">
                            <p style="margin:0 0 8px 0;font-weight:600;">Team CAMS Services</p>
                            <p style="margin:0;">KidzRunz Programme · IG9 5BT · support@camsservices.co.uk</p>
                            <p style="margin:8px 0 0 0;">
                                <a href="{{ config('services.frontend.url', env('FRONTEND_URL', config('app.url'))) }}/privacy-policy" style="color:#93c5fd;text-decoration:none;">Privacy Policy</a> ·
                                <a href="{{ config('services.frontend.url', env('FRONTEND_URL', config('app.url'))) }}/terms-of-service" style="color:#93c5fd;text-decoration:none;">Terms</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
