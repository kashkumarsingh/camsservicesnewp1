/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "react",
      "react-dom",
      "@tanstack/react-query",
      "zustand"
    ]
  }
};

export default nextConfig;

