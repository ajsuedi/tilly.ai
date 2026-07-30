/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/', destination: '/app/index.html', permanent: false }
    ];
  }
};
export default nextConfig;
