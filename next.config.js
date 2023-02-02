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
	async redirects() {
		return [
			{
				source: "/resume",
				destination: "https://github.com/matteing/resume/blob/main/resume.pdf",
			        permanent: false,
        			basePath: false
			},
			{
				source: "/linkedin",
				destination: "https://www.linkedin.com/in/sergiomattei/",
			        permanent: false,
        			basePath: false
			},
			{
				source: "/freelance",
				destination: "https://www.notion.so/unfinite/Freelance-e4e3374b79bf4efa89b936a85dbc82d3",
			        permanent: false,
        			basePath: false
			},
		]
	}
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
