import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Tweet } from "matteing-fork-react-twitter-widgets";
import { BaseProps } from "../types";

export function TweetFigure({
	alt,
	tweetId,
	className,
}: {
	tweetId: string;
	alt?: string;
	className?: string;
}) {
	const [ready, setReady] = useState(false);

	return (
		<figure className="text-center">
			<div
				className={`relative block min-h-[245px] overflow-hidden rounded-xl ${className}`}
			>
				<AnimatePresence initial={false}>
					{!ready && (
						<m.div
							key="placeholder"
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute top-0 left-0 h-full w-full bg-white"
						>
							<div className="flex animate-pulse items-center justify-center">
								<div className="h-[245px] w-[550px] rounded-xl bg-gray-100"></div>
							</div>
						</m.div>
					)}
					<div className="mx-auto max-w-[550px]">
						<Tweet
							tweetId={tweetId}
							onLoad={() => setTimeout(() => setReady(true), 200)}
						/>
					</div>
				</AnimatePresence>
			</div>
			{alt && (
				<figcaption className="!mt-2 !text-base text-gray-500">
					{alt}
				</figcaption>
			)}
		</figure>
	);
}

export function ImageFigure(
	imageProps: ImageProps & { alt: string; className?: string }
) {
	const { alt, className } = imageProps;
	return (
		<figure className="text-center">
			<div
				className={`relative block overflow-hidden rounded-xl bg-gray-50 ${className}`}
			>
				<Image layout="responsive" {...imageProps} alt={alt} />
			</div>
			{alt && (
				<figcaption className="!mt-3 text-base text-gray-500">
					{alt}
				</figcaption>
			)}
		</figure>
	);
}

export default function EmptyFigure({
	children,
	className,
	alt,
}: BaseProps & { alt: string; className?: string }) {
	return (
		<figure className="text-center">
			<div
				className={`relative block overflow-hidden rounded-xl bg-gray-50 ${className}`}
			>
				{children}
			</div>
			{alt && (
				<figcaption className="!mt-3 text-base text-gray-500">
					{alt}
				</figcaption>
			)}
		</figure>
	);
}
