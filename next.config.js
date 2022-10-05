/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: ["i.scdn.co", "miro.medium.com", "cms.matteing.com"],
	},
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
	async rewrites() {
		return [
			{
				source: "/rss",
				destination: "/api/rss/getRss",
			},
			{
				source: "/content/:path*",
				destination: "https://cms.matteing.com/content/:path*",
			},
		];
	},
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
