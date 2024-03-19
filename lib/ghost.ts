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

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                    Posts                                   */
/* -------------------------------------------------------------------------- */

export async function getPostBySlug(slug: string): Promise<GhostPost> {
	const post = await adminApi.posts.read({ slug, include: "tags,authors" });
	return parseAdminPost(post);
}

export async function getPostByUuid(uuid: string): Promise<GhostPost> {
	// https://github.com/TryGhost/SDK/issues/380
	const posts = await adminApi.posts.browse({
		filter: `uuid:${uuid}`,
		include: "tags,authors",
	});
	if (posts.length === 1) {
		return parseAdminPost(posts[0]);
	} else {
		const err = new Error();
		throw Object.defineProperty(err, "type", {
			value: "NotFoundError",
		});
	}
}

export async function getAllPosts(): Promise<GhostPost[]> {
	const posts = await adminApi.posts.browse({
		include: "tags,authors",
		limit: "all", // this won't work well with too many posts.
	});
	return posts.map(parseAdminPost);
}

export async function getPublishedPostBySlug(slug: string): Promise<GhostPost> {
	const post = await adminApi.posts.read({
		slug,
		include: "tags,authors",
		filter: "status:published",
	});
	return parseAdminPost(post);
}

export async function getAllPublishedPosts(): Promise<GhostPost[]> {
	const posts = await adminApi.posts.browse({
		include: "tags,authors",
		filter: "status:published",
		limit: "all", // this won't work well with too many posts.
	});
	return posts.map(parseAdminPost);
}

export async function getFeaturedPosts(): Promise<GhostPost[]> {
	const posts = await adminApi.posts.browse({
		include: "tags,authors",
		filter: "status:published+featured:true",
		limit: 2,
	});
	return posts.map(parseAdminPost);
}

/* -------------------------------------------------------------------------- */
/*                                    Pages                                   */
/* -------------------------------------------------------------------------- */

export async function getPageBySlug(slug: string): Promise<GhostPost> {
	const post = await adminApi.pages.read({ slug, include: "tags,authors" });
	return parseAdminPost(post);
}

export async function getAllPages(): Promise<GhostPost[]> {
	const posts = await adminApi.pages.browse({
		include: "tags,authors",
		limit: "all", // this won't work well with too many posts.
	});
	return posts.map(parseAdminPost);
}

export async function getPublishedPageBySlug(slug: string): Promise<GhostPost> {
	const post = await adminApi.pages.read({
		slug,
		include: "tags,authors",
		filter: "status:published",
	});
	return parseAdminPost(post);
}

export async function getAllPublishedPages(): Promise<GhostPost[]> {
	const posts = await adminApi.pages.browse({
		include: "tags,authors",
		filter: "status:published",
		limit: "all", // this won't work well with too many posts.
	});
	return posts.map(parseAdminPost);
}

/* -------------------------------------------------------------------------- */
/*                           Static Path Generation                           */
/* -------------------------------------------------------------------------- */

export interface StaticPathDefinition {
	params: {
		uuid: string;
		slug: string;
	};
}

export async function getAllPostPaths(): Promise<StaticPathDefinition[]> {
	const posts = (await adminApi.posts.browse({
		fields: "slug,uuid",
		limit: "all", // this won't work well with too many posts.
	})) as GhostPost[];
	return posts.map(({ slug, uuid }) => ({ params: { uuid, slug } }));
}

export async function getAllPublishedPostsPaths(): Promise<
	StaticPathDefinition[]
> {
	const posts = (await adminApi.posts.browse({
		fields: "slug,uuid",
		filter: "status:published",
		limit: "all", // this won't work well with too many posts.
	})) as GhostPost[];
	return posts.map(({ slug, uuid }) => ({ params: { uuid, slug } }));
}

export async function getAllPublishedPagesPaths(): Promise<
	StaticPathDefinition[]
> {
	const posts = (await adminApi.pages.browse({
		fields: "slug,uuid",
		filter: "status:published",
		limit: "all", // this won't work well with too many posts.
	})) as GhostPost[];
	return posts.map(({ slug, uuid }) => ({ params: { uuid, slug } }));
}

/* -------------------------------------------------------------------------- */
/*                             Image Optimization                             */
/* -------------------------------------------------------------------------- */

/**
 * https://plaiceholder.co/docs/upgrading-to-3
 */
export async function generateBlurImageFromSource(src: string) {
	try {
		const buffer = await fetch(src).then(async (res) =>
			Buffer.from(await res.arrayBuffer())
		);

		const {
			metadata: { height, width },
			...plaiceholder
		} = await getPlaiceholder(buffer, { size: 10 });

		return {
			...plaiceholder,
			img: { src, height, width },
		};
	} catch (err) {
		// We want build to fail loudly if there's 404s or other errors.
		throw err;
	}
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
		const { base64: featureImageBlur } = await generateBlurImageFromSource(
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

/* -------------------------------------------------------------------------- */
/*                               Error Handling                               */
/* -------------------------------------------------------------------------- */

export function isNotFound(err: Error & { type?: string }): boolean {
	return err?.type === "NotFoundError";
}
