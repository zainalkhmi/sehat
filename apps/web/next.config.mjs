/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@future-health/api-client',
    '@future-health/auth',
    '@future-health/domain',
    '@future-health/fhir',
    '@future-health/supabase-adapter',
    '@future-health/ui',
    '@future-health/validation',
  ],
  reactStrictMode: true,
  output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
};

export default nextConfig;

