import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Disabled to generic output to support redirects (export doesn't support redirects)
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/blog',
        destination: '/noticias',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/noticias/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
