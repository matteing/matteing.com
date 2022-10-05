import Image, { ImageProps } from "next/image";
import { BaseProps, GhostPost } from "../../types";
import Container from "./Container";
import PostTitle from "../PostTitle";
import BaseLayout from "./BaseLayout";
import PageTitle from "../PageTitle";

export default function DarkLargeFeatureImage({
	post,
	page,
	children,
}: { post?: GhostPost; page?: GhostPost } & BaseProps) {
	const content = post || page;
	if (!content) return null;
	return (
		<BaseLayout className="dark">
			<div className="relative h-[25vh] w-full bg-gray-900 md:h-[60vh]">
				{content.featureImage && (
					<Image
						src={content.featureImage}
						layout="fill"
						objectFit={
							content.featureImageFit as ImageProps["objectFit"]
						}
						objectPosition={
							content.featureImagePosition as ImageProps["objectPosition"]
						}
						placeholder={
							content.featureImageBlur ? "blur" : undefined
						}
						blurDataURL={content.featureImageBlur}
						alt={content.featureImageAlt ?? content.title}
					/>
				)}
			</div>

			<Container>
				{post ? (
					<PostTitle className="!mb-10" post={content} />
				) : (
					<PageTitle>{content.title}</PageTitle>
				)}
				{children}
			</Container>
		</BaseLayout>
	);
}
