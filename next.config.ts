/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: true, // nếu dùng Turbopack
  },
  async rewrites() {
    return [
      {
        source: '/firmware/:version/:file*',     // URL client request
        destination: '/:file*',                  // Next.js sẽ serve trực tiếp từ public/
      },
    ];
  },
};

module.exports = nextConfig;
