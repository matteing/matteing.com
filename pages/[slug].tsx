import FeatureImage from "../components/layout/FeatureImage";
import { BaseProps, GhostPost } from "../types";
import LargeFeatureImage from "../components/layout/LargeFeatureImage";
import { NextSeo } from "next-seo";
import DarkLargeFeatureImage from "../components/layout/DarkLargeFeatureImage";
import { isNotFound } from "../lib/ghost";
import GhostRenderer from "../components/ghost-renderer/GhostRenderer";
import { ReactNode } from "react";
import { processPost } from "../lib/mobiledoc";
import { getAllPublicPages, getPublicPageBySlug } from "../lib/ghost";
import { getSeoProps } from "../lib/seo";

function Layout({ page, children }: BaseProps & { page: GhostPost }) {
	switch (page.postLayout) {
		case "large-feature-image":
			return (
				<LargeFeatureImage page={page}>{children}</LargeFeatureImage>
			);

		case "dark-large-feature-image":
			return (
				<DarkLargeFeatureImage page={page}>
					{children}
				</DarkLargeFeatureImage>
			);

		case "feature-image":
		default:
			return <FeatureImage page={page}>{children}</FeatureImage>;
	}
}

function GhostPage({ page }: { page: GhostPost }) {
	return (
		<Layout page={page}>
			<NextSeo {...getSeoProps(page)} />
			<GhostRenderer mobiledoc={page.mobiledoc} />
		</Layout>
	);
}

GhostPage.getLayout = (children: ReactNode) => children;
interface PageParams {
	slug: string;
}

export const getStaticProps = async ({ params }: { params: PageParams }) => {
	try {
		const page = await getPublicPageBySlug(params.slug);
		return {
			props: {
				page: await processPost(page),
			},
			revalidate: 43200, // Revalidate every 12 hours since we use on-demand SSG.
		};
	} catch (err) {
		if (isNotFound(err as Error)) {
			return { notFound: true };
		} else {
			// eslint-disable-next-line no-console
			console.error(err);
			throw err;
		}
	}
};

export const getStaticPaths = async () => {
	const paths = (await getAllPublicPages())
		// Map the path into the static paths object required by Next.js
		.map(({ slug }) => ({ params: { slug } }));
	return {
		paths,
		// This tells Vercel to run getStaticPaths on non-existing page.
		fallback: "blocking",
	};
};

export default GhostPage;
