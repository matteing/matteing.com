import Image, { ImageProps } from "next/image";
import { BaseProps, Post } from "../../types";
import Container from "./Container";
import PostTitle from "../PostTitle";
import BaseLayout from "./BaseLayout";

export default function LargeFeatureImage({
	post,
	children,
}: BaseProps & { post: Post }) {
	return (
		<BaseLayout>
			<div className="relative h-[25vh] w-full bg-gray-50 md:h-[60vh]">
				{post.featureImage && (
					<Image
						src={post.featureImage}
						layout="fill"
						objectFit={
							post.featureImageFit as ImageProps["objectFit"]
						}
						objectPosition={
							post.featureImagePosition as ImageProps["objectPosition"]
						}
						placeholder={post.featureImageBlur ? "blur" : undefined}
						blurDataURL={post.featureImageBlur}
						alt={post.title}
					/>
				)}
			</div>

			<Container>
				<PostTitle post={post} />
				{children}
			</Container>
		</BaseLayout>
	);
}
