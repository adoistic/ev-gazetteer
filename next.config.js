/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site is served from Cloudflare Workers Static Assets, so everything
  // is prerendered to plain files at build time. Search lives in the Worker.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
}

export default nextConfig
