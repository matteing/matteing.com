import { PropsWithChildren } from "react";

export default function Container({ children }: PropsWithChildren) {
	return (
		<div className="container mx-auto max-w-6xl px-4 sm:px-0">
			{children}
		</div>
	);
}
