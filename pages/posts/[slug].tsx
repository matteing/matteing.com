import FeatureImage from "../../components/layout/FeatureImage";
import { BaseProps, GhostPost } from "../../types";
import LargeFeatureImage from "../../components/layout/LargeFeatureImage";
import { NextSeo } from "next-seo";
import DarkLargeFeatureImage from "../../components/layout/DarkLargeFeatureImage";
import {
	getAllPublicPosts,
	getPublicPostBySlug,
	isNotFound,
} from "../../lib/ghost";
import GhostRenderer from "../../components/ghost-renderer/GhostRenderer";
import { ReactNode } from "react";
import { processPost } from "../../lib/mobiledoc";
import { getSeoProps } from "../../lib/seo";

function Layout({ post, children }: BaseProps & { post: GhostPost }) {
	switch (post.postLayout) {
		case "large-feature-image":
			return (
				<LargeFeatureImage post={post}>{children}</LargeFeatureImage>
			);

		case "dark-large-feature-image":
			return (
				<DarkLargeFeatureImage post={post}>
					{children}
				</DarkLargeFeatureImage>
			);

		case "feature-image":
		default:
			return <FeatureImage post={post}>{children}</FeatureImage>;
	}
}

function PostPage({ post }: { post: GhostPost }) {
	return (
		<Layout post={post}>
			<NextSeo {...getSeoProps(post)} />
			<GhostRenderer mobiledoc={post.mobiledoc} />
		</Layout>
	);
}

PostPage.getLayout = (children: ReactNode) => children;
interface PageParams {
	slug: string;
}

export const getStaticProps = async ({ params }: { params: PageParams }) => {
	try {
		const post = await getPublicPostBySlug(params.slug);
		return {
			props: {
				post: await processPost(post),
			},
			revalidate: 43200, // Revalidate every 12 hours since we use on-demand SSG.
		};
	} catch (err) {
		if (isNotFound(err as Error)) {
			return { notFound: true };
		} else {
			// eslint-disable-next-line no-console
			console.error(err);
			throw err;
		}
	}
};

export const getStaticPaths = async () => {
	const paths = (await getAllPublicPosts())
		// Map the path into the static paths object required by Next.js
		.map(({ slug }) => ({ params: { slug } }));
	return {
		paths,
		// This tells Vercel to run getStaticPaths on non-existing page.
		fallback: "blocking",
	};
};

export default PostPage;
