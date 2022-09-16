import { BaseProps } from "../../types";

// TODO
export default function PostTitle({ className }: BaseProps) {
	return (
		<div className={`mx-auto mt-20 mb-8 max-w-[812px] ${className}`}>
			<div className="heading mb-2 text-gray-500">Sept 15, 2022</div>
			<h1 className="text-5xl font-bold tracking-tight">Test Layout</h1>
		</div>
	);
}
