import { InferGetStaticPropsType } from "next";
import Container from "../../components/layout/Container";
import PostList from "../../components/PostList";
import { NextSeo } from "next-seo";
import PageTitle from "../../components/PageTitle";
import { getAllPublicPosts } from "../../lib/ghost";

export function PostsIndex({
	posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<Container>
			<NextSeo
				title="Posts"
				description="Sergio Mattei's personal blog"
			/>
			<PageTitle>Posts</PageTitle>
			<PostList posts={posts} />
		</Container>
	);
}

export async function getStaticProps() {
	const posts = await getAllPublicPosts();

	return {
		props: {
			posts,
		},
	};
}

export default PostsIndex;
