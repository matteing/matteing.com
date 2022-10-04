import matter from "gray-matter";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import FeatureImage from "../../components/layout/FeatureImage";
import {
	getBlurPlaceholders,
	getPublicPostBySlug,
	getPublicPosts,
} from "../../lib/blog";
import imageMetadata from "../../lib/image-metadata";
import remarkUnwrapImages from "remark-unwrap-images";
import { BaseProps, Post } from "../../types";
import LargeFeatureImage from "../../components/layout/LargeFeatureImage";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import Prose from "../../components/Prose";
import { NextSeo } from "next-seo";
import { ReactNode } from "react";
import DarkLargeFeatureImage from "../../components/layout/DarkLargeFeatureImage";

function Layout({ post, children }: BaseProps & { post: Post }) {
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

function PostPage({
	source,
	post,
}: {
	source: MDXRemoteSerializeResult;
	post: Post;
}) {
	return (
		<Layout post={post}>
			<NextSeo
				title={`${post.title} · matteing.com`}
				description={post.excerpt}
				canonical={`${process.env.NEXT_PUBLIC_URL}/posts/${post.slug}`}
				openGraph={{
					url: `${process.env.NEXT_PUBLIC_URL}/posts/${post.slug}`,
					title: post.title,
					description: post.excerpt,
					images: post.featureImage
						? [
								{
									url: `${
										process.env.NEXT_PUBLIC_URL
									}/${post.featureImage.replace(
										/^\/+/g,
										""
									)}`,
									alt: post.title,
								},
						  ]
						: [
								{
									url: `${process.env.NEXT_PUBLIC_URL}/og-image.png`,
									width: 1200,
									height: 675,
									alt: "Sergio Mattei",
									type: "image/png",
								},
						  ],
					site_name: "matteing.com",
				}}
				noindex={post.status === "unlisted"}
			/>
			<Prose>
				<MDXRemote {...source} />
			</Prose>
		</Layout>
	);
}

PostPage.getLayout = (children: ReactNode) => children;
interface PageParams {
	slug: string;
}

export const getStaticProps = async ({ params }: { params: PageParams }) => {
	const post = await getPublicPostBySlug(params.slug);
	const { content, data } = matter(post.body);

	const source = await serialize(content, {
		// Optionally pass remark/rehype plugins
		mdxOptions: {
			remarkPlugins: [remarkUnwrapImages, remarkGfm],
			// https://github.com/timlrx/rehype-prism-plus
			rehypePlugins: [imageMetadata, rehypePrism, rehypeSlug],
		},
		scope: data,
	});

	return {
		props: {
			source,
			post: await getBlurPlaceholders(post),
		},
	};
};

export const getStaticPaths = async () => {
	const paths = (await getPublicPosts())
		// Map the path into the static paths object required by Next.js
		.map(({ slug }) => ({ params: { slug } }));
	return {
		paths,
		fallback: false,
	};
};

export default PostPage;
