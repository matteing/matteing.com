import { promises as fs } from "fs";
import path from "path";
import { Post, RawPostMatter } from "../types";
import matter from "gray-matter";
import { getPlaiceholder } from "plaiceholder";
import flow from "lodash/flow";
import glob from "glob-promise";
import { hasPostTags, isPublished, isUnlisted } from "./filters";
import isDate from "lodash/isDate";
import reduce from "lodash/reduce";
import set from "lodash/fp/set";

// Directory where posts are stored.
export const POSTS_PATH = path.join(process.cwd(), "posts");

/**
 * Parses front matter into a known Post type.
 * @param matter gray-matter result
 * @returns Post
 */
export function parseFile(matter: RawPostMatter): Post {
	// We do this because getStaticPaths doesn't play nice with undefined or date types.
	return JSON.parse(
		JSON.stringify({
			slug: matter.slug,
			title: matter.data.title ?? "Untitled",
			status: matter.data.status ?? "unpublished",
			tags: matter.data.tags ?? ["Uncategorized"],
			postLayout: matter.data.postLayout ?? "feature-image",
			excerpt: matter.data.excerpt ?? "No excerpt set.",
			singleLiner: matter.data.singleLiner,
			body: matter.content,
			featured: matter.data.featured ?? false,
			featureImage: matter.data.featureImage ?? undefined,
			featureImageFit: matter.data.featureImageFit ?? "contain",
			featureImagePosition: matter.data.featureImagePosition ?? "bottom",
			featureImageBlur: matter.data.featureImageBlur ?? undefined,
			createdAt: isDate(matter.data.createdAt)
				? matter.data.createdAt.toISOString()
				: new Date("12-3-1945").toISOString(),
		})
	);
}

/**
 * Gets paths for all compliant MDX files in a folder.
 * @param path where posts are stored
 * @returns Promise<string>
 */
export interface ContentMap {
	[slug: string]: string;
}

export async function getContentMap(folderPath: string): Promise<ContentMap> {
	const foundPaths = await glob(path.join(folderPath, "**/*.mdx"));
	// Parse all paths and find the slug.
	return reduce(
		foundPaths,
		(result, value) => {
			// Set available post map to `slug => path`.
			return set(
				// Get the slug name.
				// https://stackoverflow.com/questions/19811541/get-file-name-from-absolute-path-in-nodejs
				path.basename(value, path.extname(value)),
				value,
				result
			);
		},
		{}
	);
}

export async function getPostMap(): Promise<ContentMap> {
	return await getContentMap(POSTS_PATH);
}

export async function getPostByPath(filePath: string): Promise<Post> {
	const rawFile = await fs.readFile(filePath);
	const parse = flow(matter, ({ content, data }) =>
		parseFile({
			slug: path.basename(filePath, path.extname(filePath)),
			content,
			data,
		})
	);
	return parse(rawFile);
}

export async function getPostBySlug(slug: string): Promise<Post> {
	// First, get the file.
	const contentMap = await getPostMap();
	if (contentMap.hasOwnProperty(slug)) {
		// Post exists in the filesystem.
		return await getPostByPath(contentMap[slug]);
	} else {
		// Does not exist in filesystem.
		throw new Error("Post does not exist.");
	}
}

export async function getAllPosts(): Promise<Post[]> {
	const contentMap = await getPostMap();
	return await Promise.all(
		Object.values(contentMap).map(async (post) => await getPostByPath(post))
	);
}

export async function getPublicPosts(): Promise<Post[]> {
	const allPosts = await getAllPosts();
	return allPosts.filter((post) => isPublished(post) || isUnlisted(post));
}

export async function getPublicPostBySlug(slug: string): Promise<Post> {
	const post = await getPostBySlug(slug);
	if (isPublished(post) || isUnlisted(post)) {
		return post;
	} else {
		// Post is not in the published or unlisted state.
		throw new Error("Post does not exist.");
	}
}

export async function getPostsByTag(tags: string[]): Promise<Post[]> {
	const posts = await getAllPosts();
	return posts.filter((post) => hasPostTags(post, tags));
}

/**
 * Applies any blur placeholders to the Post object.
 * Other placeholders are applied after Remark runs our custom plugin.
 * This only runs on the server.
 * @param Post
 * @returns Post w/ featureImageBlur set
 */
export async function getBlurPlaceholders(post: Post): Promise<Post> {
	if (!post.featureImage) return post;
	const { base64: featureImageBlur } = await getPlaiceholder(
		post.featureImage
	);
	return {
		...post,
		featureImageBlur,
	};
}

export async function getBlurPlaceholdersForMany(
	posts: Post[]
): Promise<Post[]> {
	return Promise.all(
		posts.map(async (post) => await getBlurPlaceholders(post))
	);
}
