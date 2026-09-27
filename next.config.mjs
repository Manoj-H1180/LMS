/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['node:sqlite'],
  // Make every deployment's client assets version-aware so cached HTML cannot
  // load chunks from a different Vercel deployment during/after a rollout.
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || 'local',
};

export default nextConfig;
