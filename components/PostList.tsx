import Link from "next/link";
import format from "date-fns/format";
import { Post } from "../types";

export default function PostList({ posts }: { posts: Post[] }) {
	return (
		<div>
			<div className="mx-auto max-w-3xl">
				<div className="group flex w-full flex-col">
					<div className="grid gap-16 lg:grid-cols-1 lg:gap-x-5 lg:gap-y-12">
						{posts.map((post) => (
							<div key={post.title}>
								<p className="text-base text-gray-500">
									<time dateTime={post.createdAt}>
										{format(
											new Date(post.createdAt),
											"MMM d, yyyy"
										)}
									</time>
								</p>
								<Link
									href={`/posts/${post.slug}`}
									key={post.slug}
								>
									<a className="mt-2 block">
										<p className="text-2xl font-semibold tracking-tight text-gray-900">
											{post.title}
										</p>
										<p className="mt-3 text-lg text-gray-500">
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
