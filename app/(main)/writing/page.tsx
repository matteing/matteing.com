import { PostList } from "@/components/posts/PostList";
import { getAllPosts } from "@/lib/posts";

export default function WritingPage() {
  const posts = getAllPosts();

  return <PostList posts={posts} />;
}
