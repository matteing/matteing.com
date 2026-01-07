import Link from "next/link";
import { PostMeta } from "@/lib/posts";

interface PostListProps {
  posts: PostMeta[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PostList({ posts }: PostListProps) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {posts.map((post) => (
        <li key={post.slug} style={{ marginBottom: "1.5rem" }}>
          <Link href={`/writing/${post.slug}`}>
            <h3 style={{ margin: 0 }}>{post.title}</h3>
          </Link>
          <time
            dateTime={post.date}
            style={{ color: "#666", fontSize: "0.875rem" }}
          >
            {formatDate(post.date)}
          </time>
        </li>
      ))}
    </ul>
  );
}
