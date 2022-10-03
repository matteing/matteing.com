import { PropsWithChildren } from "react";
import { MDXProvider as DefaultProvider } from "@mdx-js/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { BaseProps } from "../types";
import EmptyFigure, { ImageFigure, TweetFigure } from "./PostFigure";
import TestProse from "./TestProse";
import PageTitle from "./PageTitle";

const CustomHeading = ({ id, ...props }: BaseProps & { id?: string }) => {
	if (id) {
		return (
			<Link href={`#${id}`} passHref>
				<a className="heading-link">{props.children}</a>
			</Link>
		);
	}
	return <>{props.children}</>;
};

const H1 = (props: BaseProps & { id: string }) => (
	<CustomHeading {...props}>
		<h1 {...props} />
	</CustomHeading>
);
const H2 = (props: BaseProps & { id: string }) => (
	<CustomHeading {...props}>
		<h2 {...props} />
	</CustomHeading>
);
const H3 = (props: BaseProps & { id: string }) => (
	<CustomHeading {...props}>
		<h3 {...props} />
	</CustomHeading>
);
const H4 = (props: BaseProps & { id: string }) => (
	<CustomHeading {...props}>
		<h4 {...props} />
	</CustomHeading>
);
const H5 = (props: BaseProps & { id: string }) => (
	<CustomHeading {...props}>
		<h5 {...props} />
	</CustomHeading>
);
const H6 = (props: BaseProps & { id: string }) => (
	<CustomHeading {...props}>
		<h6 {...props} />
	</CustomHeading>
);

const components = {
	a: Link, // <--- alll of these
	h1: H1,
	h2: H2,
	h3: H3,
	h4: H4,
	h5: H5,
	h6: H6,
	PageTitle,
	Head,
	Image,
	Figure: EmptyFigure,
	ImageFigure,
	Tweet: TweetFigure,
	TestProse: TestProse,
};

export default function MDXProvider({ children }: PropsWithChildren) {
	return (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		<DefaultProvider components={components as any}>
			{children}
		</DefaultProvider>
	);
}
