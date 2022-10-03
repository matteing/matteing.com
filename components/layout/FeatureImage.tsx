import Image, { ImageProps } from "next/image";
import Container from "./Container";
import PostTitle from "../PostTitle";
import { BaseProps, Post } from "../../types";

// TODO: Preserve aspect ratio for MDX images.
// TODO: <div style={{width: '100%', height: '100%', position: 'relative'}}>
// TODO: Fast SyntaxHighlight https://colinhemphill.com/blog/fast-static-syntax-highlighting-for-mdx-in-nextjs

export default function FeatureImage({
	post,
	children,
}: { post: Post } & BaseProps) {
	return (
		<Container>
			<PostTitle post={post} className="!mb-10" />
			{post.featureImage && (
				<figure className="mb-10">
					<div className="relative aspect-video overflow-hidden rounded-xl bg-gray-50">
						<Image
							src={post.featureImage}
							layout="fill"
							objectFit={
								post.featureImageFit as ImageProps["objectFit"]
							}
							objectPosition={
								post.featureImagePosition as ImageProps["objectPosition"]
							}
							placeholder={
								post.featureImageBlur ? "blur" : undefined
							}
							blurDataURL={post.featureImageBlur}
							alt={post.title}
						/>
					</div>
				</figure>
			)}
			{children}
		</Container>
	);
}
