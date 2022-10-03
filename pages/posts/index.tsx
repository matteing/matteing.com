import { InferGetStaticPropsType } from "next";
import Container from "../../components/layout/Container";
import { getAllPosts } from "../../lib/blog";
import PostList from "../../components/PostList";
import { isPublished, isUnlisted } from "../../lib/filters";
import { NextSeo } from "next-seo";

export function PostsIndex({
	posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<Container>
			<NextSeo
				title="Posts"
				description="Sergio Mattei's personal blog"
			/>
			<div className="helvetica my-24 mx-auto flex flex-col items-center text-center text-4xl font-bold tracking-tighter md:text-6xl">
				Posts
			</div>
			<PostList posts={posts} />
		</Container>
	);
}

export async function getStaticProps() {
	const posts = (await getAllPosts()).filter(
		(post) => isPublished(post) && !isUnlisted(post)
	);

	return {
		props: {
			posts,
		},
	};
}

export default PostsIndex;
