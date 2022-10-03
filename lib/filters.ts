import intersection from "lodash/intersection";
import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import { Post } from "../types";

export function isPublished(post: Post): boolean {
	return post.status === "published";
}

export function isUnlisted(post: Post): boolean {
	return post.status === "unlisted";
}

export function isFeaturedPost(post: Post): boolean {
	return post.featured === true;
}

export function hasPostTags(post: Post, tags: string[]): boolean {
	return intersection(post.tags, tags).length > 0;
}

export function limitFeaturedPosts(posts: Post[]): Post[] {
	return posts.slice(0, 2);
}

export function filterFeaturedPosts(posts: Post[]): Post[] {
	const filtered = flow(
		orderPostsByDate,
		(posts) =>
			posts.filter((post) => isPublished(post) && isFeaturedPost(post)),
		limitFeaturedPosts
	);
	return filtered(posts);
}

export function orderPostsByDate(
	posts: Post[],
	order: "asc" | "desc" = "desc"
): Post[] {
	return orderBy(posts, "createdAt", order);
}
