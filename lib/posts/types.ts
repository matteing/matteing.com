/**
 * Metadata extracted from the YAML frontmatter of a Markdown post.
 */
export interface PostFrontmatter {
  /** The title of the post */
  title: string;
  /** The publication date in YYYY-MM-DD format */
  date: string;
  /** The URL slug for the post (e.g. 'my-first-post') */
  slug: string;
  /** Optional canonical URL if the post was originally published elsewhere */
  url?: string;
  /** Whether to pin this post to the featured section */
  featured?: boolean;
  /** Path to a cover image */
  cover?: string;
  /** A short excerpt or summary of the post */
  summary?: string;
}

/**
 * Represents a raw post loaded from the file system.
 * Content is still raw Markdown.
 */
export interface Post {
  /** The unique slug identifier */
  slug: string;
  /** The parsed frontmatter metadata */
  frontmatter: PostFrontmatter;
  /** The raw Markdown content body */
  content: string;
}

/**
 * Represents a post that has been fully processed for display.
 * Includes the rendered HTML content.
 */
export interface RenderedPost extends Post {
  /** The rendered HTML of the post content */
  contentHtml: string;
}

/**
 * Lightweight metadata for listing posts.
 * Excludes the full content body to optimize list views.
 */
export type PostMeta = Pick<
  PostFrontmatter,
  "slug" | "title" | "date" | "featured" | "cover" | "summary"
>;
