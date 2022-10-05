import Image, { ImageProps } from "next/image";
import { BaseProps, GhostPost } from "../../types";
import Container from "./Container";
import PostTitle from "../PostTitle";
import BaseLayout from "./BaseLayout";
import PageTitle from "../PageTitle";

export default function LargeFeatureImage({
	post,
	page,
	children,
}: BaseProps & { post?: GhostPost; page?: GhostPost }) {
	const content = post || page;
	if (!content) return null;
	return (
		<BaseLayout>
			<div className="relative h-[25vh] w-full bg-gray-50 md:h-[50vh] lg:h-[70vh]">
				{content.featureImage && (
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
							content.featureImageBlur ? "blur" : undefined
						}
						blurDataURL={content.featureImageBlur}
						alt={content.featureImageAlt ?? content.title}
					/>
				)}
			</div>

			<Container>
				{post ? (
					<PostTitle post={content} />
				) : (
					<PageTitle>{content.title}</PageTitle>
				)}
				{children}
			</Container>
		</BaseLayout>
	);
}
