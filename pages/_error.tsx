import { NextPageContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import nyan from "../public/error/balloon-nyan.png";

function Error({ statusCode }: { statusCode: number }) {
	return (
		<>
			<div className="relative mb-4 w-[50px]">
				<Image
					src={nyan}
					alt="it's a nyan floating around"
					placeholder="blur"
				/>
			</div>
			<h1>
				{statusCode} ⎯{" "}
				{statusCode === 404 ? "page not found" : "something went wrong"}
			</h1>
			<span className="text-gray-200">
				bummer. on the other hand, here's a cute page?
			</span>
			<Link href="/">
				<a className="mt-4 text-gray-100 hover:text-white">go home →</a>
			</Link>
		</>
	);
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
	return { statusCode };
};

Error.getLayout = (element: ReactNode) => (
	<div
		className="bg-dark-500 flex h-screen flex-col bg-[#013C6E]"
		style={{ backgroundImage: `url("/error/nyan-bg.jpeg")` }}
	>
		<div className="flex grow flex-col items-center justify-center px-6 text-center font-mono text-white">
			{element}
		</div>
	</div>
);

export default Error;
