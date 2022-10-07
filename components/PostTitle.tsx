import { formatShortDate } from "../lib/utils";
import { BaseProps, GhostPost } from "../types";

// TODO
export default function PostTitle({
	post,
	className,
}: { post: GhostPost } & BaseProps) {
	const date = post.publishedAt || post.createdAt;
	return (
		<div>
			<div
				className={`mx-auto mt-12 sm:max-w-[655px] md:mb-6 lg:mt-20 lg:mb-10 lg:max-w-[812px] ${className}`}
			>
				<small className="heading mb-2 block text-gray-500">
					{date ? formatShortDate(date) : null}{" "}
					{post.status === "draft" ? (
						<>
							⎯ <span className="text-yellow-500">📝 Draft</span>
						</>
					) : null}
				</small>
				<h1 className="mb-3">{post.title}</h1>
			</div>
		</div>
	);
}
