import Image, { ImageProps } from "next/image";
import Container from "./Container";
import PostTitle from "../PostTitle";
import { BaseProps, GhostPost } from "../../types";
import BaseLayout from "./BaseLayout";
import PageTitle from "../PageTitle";

// TODO: Preserve aspect ratio for MDX images.
// TODO: <div style={{width: '100%', height: '100%', position: 'relative'}}>
// TODO: Fast SyntaxHighlight https://colinhemphill.com/blog/fast-static-syntax-highlighting-for-mdx-in-nextjs

export default function FeatureImage({
	post,
	page,
	children,
}: { post?: GhostPost; page?: GhostPost } & BaseProps) {
	const content = post || page;
	if (!content) return null;
	return (
		<BaseLayout>
			<Container>
				{post ? (
					<PostTitle className="!mb-10" post={content} />
				) : (
					<PageTitle>{content.title}</PageTitle>
				)}
				{content.featureImage && (
					<figure className="mb-10">
						<div className="relative aspect-video overflow-hidden rounded-xl bg-gray-50">
							<Image
								src={content.featureImage}
								layout="fill"
								objectFit={
									(content.featureImageFit as ImageProps["objectFit"]) ??
									"cover"
								}
								objectPosition={
									content.featureImagePosition as ImageProps["objectPosition"]
								}
								placeholder={
									content.featureImageBlur
										? "blur"
										: undefined
								}
								blurDataURL={content.featureImageBlur}
								alt={content.featureImageAlt ?? content.title}
							/>
						</div>
					</figure>
				)}
				{children}
			</Container>
		</BaseLayout>
	);
}
