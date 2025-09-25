/** @type {import('next').NextConfig} */
const nextConfig = {
   output: 'export',
  images: {
    unoptimized: true, // required for static export if you use <Image />
  },
};

export default nextConfig;
