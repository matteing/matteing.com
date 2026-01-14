import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Post, PostFrontmatter } from "./types";

export class PostRepository {
  private cache: Map<string, Post> | null = null;

  constructor(private readonly postsDirectory: string) {}

  private load(): Map<string, Post> {
    if (this.cache) return this.cache;

    this.cache = new Map();
    // Ensure directory exists to avoid crashes
    if (!fs.existsSync(this.postsDirectory)) {
      return this.cache;
    }

    const files = fs.readdirSync(this.postsDirectory);

    for (const file of files) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

      const fullPath = path.join(this.postsDirectory, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      const slug = data.slug || file.replace(/\.mdx?$/, "");

      // Ensure date is a string
      const dateStr =
        data.date instanceof Date
          ? data.date.toISOString().split("T")[0]
          : data.date;

      const frontmatter: PostFrontmatter = {
        title: data.title,
        date: dateStr,
        slug,
        url: data.url,
        featured: data.featured,
        cover: data.cover,
        summary: data.summary,
      };

      this.cache.set(slug, {
        slug,
        frontmatter,
        content,
      });
    }

    return this.cache;
  }

  getAll(): Post[] {
    return Array.from(this.load().values()).sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
  }

  getBySlug(slug: string): Post | null {
    return this.load().get(slug) || null;
  }

  getSlugs(): string[] {
    return Array.from(this.load().keys());
  }
}
