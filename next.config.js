/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  // Disable webpack caching to avoid module conflicts
  webpack: (config) => {
    config.cache = false;
    config.externals.push('esbuild');
    return config;
  },
};

module.exports = nextConfig;
