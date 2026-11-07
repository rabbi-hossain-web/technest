/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  serverExternalPackages: ['mongoose'],
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
