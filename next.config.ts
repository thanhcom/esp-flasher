/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["xterm", "crypto-js", "web-serial-polyfill"], // chỉ JS packages
  rewrites() {
    return [
      {
        source: '/firmware/:version/:file*',
        destination: '/firmware/:version/:file*',
      },
    ];
  },
};
module.exports = nextConfig;
