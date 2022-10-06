// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import GhostAdminAPI from "@tryghost/admin-api";
import GhostContentAPI from "@tryghost/content-api";
import {
	NEXT_PUBLIC_GHOST_URL,
	NEXT_PUBLIC_GHOST_CONTENT_KEY,
	GHOST_ADMIN_KEY,
} from "../config";
import { AdminPostOrPage, GhostPost } from "../types";
import humps, { Camelized } from "humps";
import { isJson } from "./utils";
import { Mobiledoc } from "@bustle/mobiledoc-vdom-renderer";
import { getPlaiceholder } from "plaiceholder";
import { ImageCardPayload } from "../components/ghost-renderer/ImageCard";

if (!GHOST_ADMIN_KEY) throw new Error("GHOST_ADMIN_KEY not set.");
if (!NEXT_PUBLIC_GHOST_CONTENT_KEY)
	throw new Error("NEXT_PUBLIC_GHOST_CONTENT_KEY not set.");

export const adminApi = GhostAdminAPI({
	url: NEXT_PUBLIC_GHOST_URL,
	key: GHOST_ADMIN_KEY,
	version: "v5.0",
});

export const contentApi = GhostContentAPI({
	url: NEXT_PUBLIC_GHOST_URL,
	key: NEXT_PUBLIC_GHOST_CONTENT_KEY ?? "",
	version: "v5.0",
});

function getAssetUrl(url: string): string {
	if (url.startsWith("https://matteing.com")) {
		return url.replace("https://matteing.com", NEXT_PUBLIC_GHOST_URL);
	} else {
		return url;
	}
}

// Total hack that sets all asset URLs to the correct ones
// Ghost with admin=X and url=Y returns incorrect paths.
export function fixAssetPaths(mobiledoc: Mobiledoc): Mobiledoc {
	return {
		...mobiledoc,
		cards: mobiledoc.cards.map((card) => {
			const [type, payload] = card;
			if (type === "image") {
				return [
					type,
					{
						...(payload as ImageCardPayload),
						src: getAssetUrl((payload as ImageCardPayload).src),
					},
				];
			} else {
				return card;
			}
		}),
	};
}

// https://github.com/TryGhost/SDK/issues/446
export function parseAdminPost(raw: AdminPostOrPage): GhostPost {
	const result = humps.camelizeKeys(raw) as Camelized<AdminPostOrPage>;
	const injectedOpts: Partial<GhostPost> = isJson(
		result.codeinjectionHead ?? ""
	)
		? JSON.parse(result.codeinjectionHead ?? "")
		: {};
	return {
		...result,
		postLayout: "feature-image",
		featureImage: raw.feature_image
			? getAssetUrl(raw.feature_image)
			: raw.feature_image,
		mobiledoc: fixAssetPaths(JSON.parse(raw.mobiledoc) as Mobiledoc),
		plaintext: raw.plaintext ?? null,
		...injectedOpts,
	};
}

// Posts

export async function getPostBySlug(slug: string): Promise<GhostPost> {
	const post = await adminApi.posts.read({ slug, include: "tags,authors" });
	return parseAdminPost(post);
}

export async function getAllPosts(): Promise<GhostPost[]> {
	const posts = await adminApi.posts.browse({ include: "tags,authors" });
	return posts.map(parseAdminPost);
}

export async function getPublicPostBySlug(slug: string): Promise<GhostPost> {
	const post = await adminApi.posts.read({
		slug,
		include: "tags,authors",
		filter: "visibility:public", // Do not include status:published for unlisted posts.
	});
	return parseAdminPost(post);
}

export async function getAllPublicPosts(): Promise<GhostPost[]> {
	const posts = await adminApi.posts.browse({
		include: "tags,authors",
		filter: "visibility:public",
	});
	return posts.map(parseAdminPost);
}

// Published !== unlisted.
export async function getAllPublishedPosts(): Promise<GhostPost[]> {
	const posts = await adminApi.posts.browse({
		include: "tags,authors",
		filter: "status:published",
	});
	return posts.map(parseAdminPost);
}

export async function getAllPublishedPostsForRss(): Promise<GhostPost[]> {
	const posts = await adminApi.posts.browse({
		include: "tags,authors",
		filter: "status:published",
		formats: "plaintext,mobiledoc",
	});
	return posts.map(parseAdminPost);
}

export async function getAllPublicPostsForRss(): Promise<GhostPost[]> {
	const posts = await adminApi.posts.browse({
		include: "tags,authors",
		filter: "visibility:public",
		formats: "plaintext,mobiledoc",
	});
	return posts.map(parseAdminPost);
}

export async function getFeaturedPosts(): Promise<GhostPost[]> {
	const posts = await adminApi.posts.browse({
		include: "tags,authors",
		filter: "visibility:public+featured:true",
		limit: 2,
	});
	return posts.map(parseAdminPost);
}

// Pages
export async function getPageBySlug(slug: string): Promise<GhostPost> {
	const post = await adminApi.pages.read({ slug, include: "tags,authors" });
	return parseAdminPost(post);
}

export async function getAllPages(): Promise<GhostPost[]> {
	const posts = await adminApi.pages.browse({ include: "tags,authors" });
	return posts.map(parseAdminPost);
}

export async function getPublicPageBySlug(slug: string): Promise<GhostPost> {
	const post = await adminApi.pages.read({
		slug,
		include: "tags,authors",
		filter: "visibility:public", // Do not include status:published for unlisted posts.
	});
	return parseAdminPost(post);
}

export async function getAllPublicPages(): Promise<GhostPost[]> {
	const posts = await adminApi.pages.browse({
		include: "tags,authors",
		filter: "visibility:public",
	});
	return posts.map(parseAdminPost);
}

/**
 * Applies any blur placeholders to the Post object.
 * Other placeholders are applied after Remark runs our custom plugin.
 * This only runs on the server.
 * @param Post
 * @returns Post w/ featureImageBlur set
 */
export async function getBlurFeatureImage(post: GhostPost): Promise<GhostPost> {
	if (post.featureImage) {
		const { base64: featureImageBlur } = await getPlaiceholder(
			post.featureImage
		);
		return {
			...post,
			featureImageBlur,
		};
	} else {
		return { ...post };
	}
}

export async function getBlurFeatureImageForMany(
	posts: GhostPost[]
): Promise<GhostPost[]> {
	return Promise.all(
		posts.map(async (post) => await getBlurFeatureImage(post))
	);
}

export function isNotFound(err: Error & { type?: string }): boolean {
	return err?.type === "NotFoundError";
}
