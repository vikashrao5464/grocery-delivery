import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
      {hostname:"lh3.googleusercontent.com"},
      {hostname:"media.istockphoto.com"},
      {hostname:"images.unsplash.com"},
      {hostname:"res.cloudinary.com"}
    ]
  }

};

export default nextConfig;
