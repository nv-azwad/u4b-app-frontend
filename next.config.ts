import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // <--- ADD THIS TOO (Prevents image errors on Netlify)
  },
};

export default nextConfig;
