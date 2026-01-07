import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import RSS from "rss";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";

const postsDirectory = path.join(process.cwd(), "data/posts");

/** rehype-pretty-code configuration */
const prettyCodeOptions: PrettyCodeOptions = {
  // Use dual themes for light/dark mode syntax colors
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  // Don't use theme background - we use our own grayscale
  keepBackground: false,
  // Default language for code blocks without a language
  defaultLang: "plaintext",
  // Grid layout for proper line highlighting
  grid: true,
};

export interface PostFrontmatter {
  title: string;
  date: string;
  slug: string;
  url?: string;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  contentHtml: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
}

/**
 * Remove the first H1 heading if it matches the title (case-insensitive, ignoring punctuation)
 */
function removeRedundantTitle(content: string, title: string): string {
  const lines = content.split("\n");
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Check if it's an H1
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      const headingText = h1Match[1];
      if (normalizeText(headingText) === normalizeText(title)) {
        // Remove this line and any following empty line
        lines.splice(i, 1);
        if (lines[i]?.trim() === "") {
          lines.splice(i, 1);
        }
        return lines.join("\n");
      }
    }

    // If we hit non-empty, non-H1 content first, don't remove anything
    break;
  }

  return content;
}

export function getPostSlugs(): string[] {
  const files = fs.readdirSync(postsDirectory);
  return files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => {
      const { data } = matter(
        fs.readFileSync(path.join(postsDirectory, file), "utf8")
      );
      return data.slug || file.replace(/\.mdx?$/, "");
    });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const files = fs.readdirSync(postsDirectory);

  for (const file of files) {
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

    const fullPath = path.join(postsDirectory, file);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    if (data.slug === slug) {
      // Remove redundant H1 title if it matches frontmatter title
      const cleanedContent = removeRedundantTitle(content, data.title);

      const processedContent = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypePrettyCode, prettyCodeOptions)
        .use(rehypeStringify)
        .process(cleanedContent);

      return {
        slug: data.slug,
        frontmatter: data as PostFrontmatter,
        content: cleanedContent,
        contentHtml: processedContent.toString(),
      };
    }
  }

  return null;
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDirectory);

  const posts = files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => {
      const fullPath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug: data.slug,
        title: data.title,
        date: data.date,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

/**
 * Generate an RSS 2.0 feed for all blog posts
 * @param baseUrl - The base URL of your site (e.g., https://matteing.com)
 * @returns The RSS XML string
 */
export async function generateRssFeed(baseUrl: string): Promise<string> {
  const posts = getAllPosts();

  // Get full post content for each post
  const postsWithContent = await Promise.all(
    posts.map(async (post) => {
      const fullPost = await getPostBySlug(post.slug);
      return fullPost;
    })
  );

  const feed = new RSS({
    title: "matteing.com",
    description: "Sergio's blog about technology, ideas, and life",
    feed_url: `${baseUrl}/feed.xml`,
    site_url: baseUrl,
    language: "en",
    webMaster: "sergio@matteing.com",
    managingEditor: "sergio@matteing.com",
  });

  // Add each post as a feed item
  for (const post of postsWithContent) {
    if (!post) continue;

    const postUrl = `${baseUrl}/writing/${post.slug}`;

    feed.item({
      title: post.frontmatter.title,
      description: post.contentHtml, // Full HTML content
      url: postUrl,
      guid: postUrl, // Use URL as unique ID
      author: "sergio@matteing.com",
      date: new Date(post.frontmatter.date),
    });
  }

  return feed.xml({ indent: true });
}
