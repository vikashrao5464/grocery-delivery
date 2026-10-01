import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack:{
    root:process.cwd()
  },
  /* config options here */
  images:{
    remotePatterns:[
      {protocol: 'https',hostname:"lh3.googleusercontent.com"},
      {protocol: 'https',hostname:"media.istockphoto.com"},
      {protocol: 'https',hostname:"images.unsplash.com"},
      {protocol: 'https',hostname:"res.cloudinary.com"}
    ],
      dangerouslyAllowSVG: true,
    unoptimized: true 
  }

};

export default nextConfig;
