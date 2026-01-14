import { PostList } from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Writing",
};

export default function WritingPage() {
  const posts = getAllPosts();

  return <PostList posts={posts} />;
}
