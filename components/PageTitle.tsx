import React, { PropsWithChildren } from "react";

export default function PageTitle({ children }: PropsWithChildren) {
	return (
		<div className="helvetica my-12 mx-auto flex flex-col items-center text-center text-4xl font-bold tracking-tighter md:my-24 md:text-6xl">
			{children}
		</div>
	);
}
