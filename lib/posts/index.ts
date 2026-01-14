import path from "path";
import RSS from "rss";
import { PostRepository } from "./repository";
import { MarkdownRenderer } from "./renderer";
import {
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_AUTHOR_EMAIL,
  SITE_LANGUAGE,
} from "../config";
import type { PostMeta, RenderedPost } from "./types";

export type { Post, PostMeta, RenderedPost, PostFrontmatter } from "./types";

const postsDirectory = path.join(process.cwd(), "data/posts");
const repository = new PostRepository(postsDirectory);
const renderer = new MarkdownRenderer();

export function getPostSlugs(): string[] {
  return repository.getSlugs();
}

export function getAllPosts(): PostMeta[] {
  return repository.getAll().map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    date: post.frontmatter.date,
    featured: post.frontmatter.featured,
    cover: post.frontmatter.cover,
    summary: post.frontmatter.summary,
  }));
}

export async function getPostBySlug(
  slug: string
): Promise<RenderedPost | null> {
  const post = repository.getBySlug(slug);
  if (!post) return null;

  const cleanedContent = MarkdownRenderer.stripRedundantTitle(
    post.content,
    post.frontmatter.title
  );
  const contentHtml = await renderer.render(cleanedContent);

  return {
    ...post,
    content: cleanedContent,
    contentHtml,
  };
}

export function getFeaturedPost(): PostMeta | undefined {
  return getAllPosts().find((post) => post.featured);
}

export function getFeaturedPosts(limit: number = 3): PostMeta[] {
  return getAllPosts()
    .filter((post) => post.featured)
    .slice(0, limit);
}

export async function generateRssFeed(baseUrl: string): Promise<string> {
  const posts = repository.getAll();

  const feed = new RSS({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    feed_url: `${baseUrl}/feed.xml`,
    site_url: baseUrl,
    language: SITE_LANGUAGE,
    webMaster: SITE_AUTHOR_EMAIL,
    managingEditor: SITE_AUTHOR_EMAIL,
  });

  for (const post of posts) {
    const cleanedContent = MarkdownRenderer.stripRedundantTitle(
      post.content,
      post.frontmatter.title
    );
    const contentHtml = await renderer.render(cleanedContent);
    const postUrl = `${baseUrl}/writing/${post.slug}`;

    feed.item({
      title: post.frontmatter.title,
      description: contentHtml,
      url: postUrl,
      guid: postUrl,
      author: SITE_AUTHOR_EMAIL,
      date: new Date(post.frontmatter.date),
    });
  }

  return feed.xml({ indent: true });
}
