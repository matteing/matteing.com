import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Enable MDX page extensions for direct .mdx file routing if needed
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
