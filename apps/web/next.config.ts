import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  /**
   * This is needed for the nginx proxy to work correctly.
   * https://nextjs.org/docs/app/guides/self-hosting#streaming-and-suspense
   */
  async headers() {
    return [
      {
        source: "/:path*{/}?",
        headers: [
          {
            key: "X-Accel-Buffering",
            value: "no",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
