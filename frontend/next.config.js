/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Required for Docker/Render (frontend Dockerfile copies .next/standalone)
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "http", hostname: "localhost", pathname: "**/storage/**" },
      // CMS images (Laravel storage) — dev uses localhost above; prod uses backend origin
      { protocol: "https", hostname: "cams-backend.onrender.com", pathname: "**/storage/**" },
      { protocol: "https", hostname: "cams-backend-oj5x.onrender.com", pathname: "**/storage/**" },
      // If you use a custom API domain or CDN for images, add it here (no wildcards in hostname).
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async rewrites() {
    // Backend base may be origin only (e.g. http://localhost:9080) or full base (http://localhost:9080/api/v1)
    let backendBase = (process.env.API_URL || "http://localhost:9080").replace(/\/$/, "");
    if (!backendBase.endsWith("/api/v1")) {
      backendBase = `${backendBase}/api/v1`;
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendBase}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  compress: true,
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Turbopack-only: moment locales trimmed via src/utils/moment-locales.ts (en-gb + en).
  turbopack: {},
};

module.exports = nextConfig;
