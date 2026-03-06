import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.lapakgaming.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.codashop.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unipin.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'play-lh.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.tapimg.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.valorant-api.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.steamstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.z8games.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.pointblank.id',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
