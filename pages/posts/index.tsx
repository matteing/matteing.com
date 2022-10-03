import { InferGetStaticPropsType } from "next";
import Container from "../../components/layout/Container";
import { getAllPosts } from "../../lib/blog";
import PostList from "../../components/PostList";
import { isPublished, isUnlisted, orderPostsByDate } from "../../lib/filters";
import { NextSeo } from "next-seo";
import PageTitle from "../../components/PageTitle";

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
	const posts = orderPostsByDate(
		(await getAllPosts()).filter(
			(post) => isPublished(post) && !isUnlisted(post)
		)
	);

	return {
		props: {
			posts,
		},
	};
}

export default PostsIndex;
