import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/feed.xml",
        destination: "/api/feed",
      },
      {
        source: "/rss.xml",
        destination: "/api/feed",
      },
      {
        source: "/feed",
        destination: "/api/feed",
      },
      {
        source: "/writing/:slug.md",
        destination: "/api/posts/:slug",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/resume",
        destination: "https://github.com/matteing/resume/blob/main/resume.pdf",
        permanent: false,
        basePath: false,
      },
      {
        source: "/linkedin",
        destination: "https://www.linkedin.com/in/sergiomattei/",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
