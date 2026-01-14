import { getPostBySlug } from "@/lib/posts";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Prepend frontmatter as YAML for full context
  const frontmatter = `---
title: ${post.frontmatter.title}
date: ${post.frontmatter.date}
${post.frontmatter.summary ? `summary: ${post.frontmatter.summary}` : ""}
---

`;

  return new NextResponse(frontmatter + post.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
