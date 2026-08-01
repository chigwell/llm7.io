/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "cdn-avatars.huggingface.co" },
      { protocol: "https", hostname: "chathub.gg" },
    ],
  },
};

module.exports = nextConfig;
