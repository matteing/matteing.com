import { PropsWithChildren } from "react";
import { BaseProps } from "../../types";

export function TypeSection({ children, className = "" }: BaseProps) {
	return (
		<div
			className={`container mx-auto max-w-4xl px-4 md:px-2 ${className}`}
		>
			{children}
		</div>
	);
}

export default function Container({ children }: PropsWithChildren) {
	return (
		<div className="container mx-auto max-w-6xl px-4 md:px-6 xl:px-0">
			{children}
		</div>
	);
}
