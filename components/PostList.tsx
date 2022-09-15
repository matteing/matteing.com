export default function PostList() {
	const posts = ["Post 1", "Post 2", "Post 3", "Post 1", "Post 2", "Post 3"];
	return (
		<div className="mb-24">
			<div className="mx-auto max-w-3xl">
				<div className="group flex w-full flex-col">
					{posts.map((title) => (
						<div
							key={title}
							className="interactable box-border flex items-center gap-4 overflow-hidden border-b border-gray-100 py-4 last:border-none hover:z-10 hover:rounded-md hover:border-white hover:px-4 group-hover:border-gray-50"
						>
							<div className="text-sm font-semibold uppercase tracking-tight text-purple-500">
								May 1
							</div>
							<div className="text-lg">{title}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
