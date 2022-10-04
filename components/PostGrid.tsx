import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Post } from "../types";

export default function PostGrid({
	posts,
	withImages = true,
}: {
	posts: Post[];
	withImages?: boolean;
}) {
	return (
		<AnimatePresence>
			<m.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="inter mb-24 grid gap-12 lg:grid-cols-2"
			>
				{posts.map((post) => (
					<Link href={`/posts/${post.slug}`} key={post.slug}>
						<div className="interactable scalable flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
							<div className="flex grow flex-col justify-center p-6 py-10">
								<h4 className="mb-">{post.title}</h4>
								<p className="text-base text-gray-500 line-clamp-1">
									{post.singleLiner ?? post.excerpt}
								</p>
							</div>
							{post.featureImage && withImages && (
								<div className="relative flex h-64 items-center overflow-hidden rounded-b-xl bg-gray-50">
									<Image
										priority
										src={post.featureImage}
										objectFit="cover"
										className="z-10"
										layout="fill"
										placeholder={
											post.featureImageBlur
												? "blur"
												: "empty"
										}
										blurDataURL={post.featureImageBlur}
										alt={post.title}
									/>
								</div>
							)}
						</div>
					</Link>
				))}
			</m.div>
		</AnimatePresence>
	);
}
