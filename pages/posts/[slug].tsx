import FeatureImage from "../../components/layout/FeatureImage";
import { BaseProps, GhostPost } from "../../types";
import LargeFeatureImage from "../../components/layout/LargeFeatureImage";
import { NextSeo } from "next-seo";
import DarkLargeFeatureImage from "../../components/layout/DarkLargeFeatureImage";
import {
	getAllPublishedPostsPaths,
	getPublishedPostBySlug,
	isNotFound,
} from "../../lib/ghost";
import GhostRenderer from "../../components/ghost-renderer/GhostRenderer";
import { ReactNode, useEffect, useRef } from "react";
import { processPost } from "../../lib/mobiledoc";
import { getSeoProps } from "../../lib/seo";

import "katex/dist/katex.min.css";
import "katex";
import renderMathInElement from "katex/contrib/auto-render";

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
	const ref = useRef(null);

	useEffect(() => {
		if (ref.current) {
			renderMathInElement(ref.current, {
				delimiters: [
					{ left: "$$", right: "$$", display: true },
					{ left: "\\[", right: "\\]", display: true },
					{ left: "$", right: "$", display: false },
					{ left: "\\(", right: "\\)", display: false },
				],
			});
		}
	}, []);

	return (
		<Layout post={post}>
			<NextSeo {...getSeoProps(post)} />
			<div ref={ref}>
				<GhostRenderer mobiledoc={post.mobiledoc} />
			</div>
		</Layout>
	);
}

PostPage.getLayout = (children: ReactNode) => children;
interface PageParams {
	slug: string;
}

export const getStaticProps = async ({ params }: { params: PageParams }) => {
	try {
		const post = await getPublishedPostBySlug(params.slug);
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
	const paths = await getAllPublishedPostsPaths();
	return {
		paths,
		// This tells Vercel to run getStaticPaths on non-existing page.
		fallback: "blocking",
	};
};

export default PostPage;
