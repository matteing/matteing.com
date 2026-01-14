import NextLink from "next/link";
import { PostMeta } from "@/lib/posts";
import { LocaleDate } from "@/components/LocaleDate";
import styles from "./PostList.module.css";

interface PostListProps {
  posts: PostMeta[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.slug} className={styles.item}>
          <NextLink href={`/writing/${post.slug}`}>
            <h3 className={styles.title}>{post.title}</h3>
          </NextLink>
          <LocaleDate
            date={post.date}
            className="text-text-secondary text-sm"
          />
        </li>
      ))}
    </ul>
  );
}
