import { Link as StyledLink } from "@/components/Link";
import { LocaleDate } from "@/components/LocaleDate";
import type { PostMeta } from "@/lib/posts";

interface FeaturedPostsProps {
  posts: PostMeta[];
}

/**
 * Featured blog posts grid for the homepage.
 */
export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {posts.map((post) => (
        <article key={post.slug} className="group">
          <h3 className="mb-1 font-semibold">
            <StyledLink href={`/writing/${post.slug}`}>{post.title}</StyledLink>
          </h3>
          <LocaleDate
            date={post.date}
            className="text-text-secondary mb-2 block text-sm"
          />

          {post.summary && (
            <p className="text-text-secondary mb-4">{post.summary}</p>
          )}
        </article>
      ))}
    </div>
  );
}
