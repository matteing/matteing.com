// Here because it runs on the client too.

import { NextSeoProps } from "next-seo";
import { NEXT_PUBLIC_URL } from "../config";
import { GhostPost } from "../types";

// Breaks if placed in ghost.ts
export function getSeoProps(post: GhostPost): NextSeoProps {
	return {
		title: `${post.title} · matteing.com`,
		description: post.metaDescription ?? post.excerpt,
		canonical: post.canonicalUrl ?? `${NEXT_PUBLIC_URL}/posts/${post.slug}`,
		openGraph: {
			url: `${NEXT_PUBLIC_URL}/posts/${post.slug}`,
			title: post.ogTitle ?? post.title,
			description: post.ogDescription ?? post.excerpt,
			images: post.featureImage
				? [
						{
							url: `${post.featureImage.replace(/^\/+/g, "")}`,
							alt: post.title,
						},
				  ]
				: [
						{
							url: `${NEXT_PUBLIC_URL}/og-image.png`,
							width: 1200,
							height: 675,
							alt: "Sergio Mattei",
							type: "image/png",
						},
				  ],
			site_name: "matteing.com",
		},
		noindex:
			(post.visibility !== undefined && post.visibility !== "public") ||
			post.status !== "published" ||
			post.noIndex,
	};
}
