import React, { PropsWithChildren } from "react";

export default function PageTitle({ children }: PropsWithChildren) {
	return (
		<h1 className="my-12 mx-auto flex flex-col items-center text-center md:my-20">
			{children}
		</h1>
	);
}
