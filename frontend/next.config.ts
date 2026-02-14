import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Vercel deployment
  output: "standalone",

  // Allow Supabase storage images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Fix turbopack lockfile warning
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
