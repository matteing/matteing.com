import Link from "next/link";
import { GhostPost } from "../types";
import { formatShortDate } from "../lib/utils";

export default function PostList({ posts }: { posts: GhostPost[] }) {
	return (
		<div>
			<div className="mx-auto max-w-3xl">
				<div className="group flex w-full flex-col">
					<div className="grid gap-16 lg:grid-cols-1 lg:gap-x-5 lg:gap-y-12">
						{posts.map((post) => (
							<div key={post.title}>
								<p className="text-sm text-gray-500">
									<time dateTime={post.publishedAt}>
										{post.publishedAt
											? formatShortDate(post.publishedAt)
											: null}
									</time>
								</p>
								<Link
									href={`/posts/${post.slug}`}
									key={post.slug}
								>
									<a className="mt-2 block">
										<h4 className="text-gray-900">
											{post.title}
										</h4>
										<p className="mt-3 text-base text-gray-500 line-clamp-2">
											{post.excerpt}
										</p>
									</a>
								</Link>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
