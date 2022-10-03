import "../styles/globals.css";
import BaseLayout from "../components/layout/BaseLayout";
import { AppPropsWithLayout } from "../types";
import MDXProvider from "../components/MDXProvider";
import { DefaultSeo } from "next-seo";
import { LazyMotion, domAnimation } from "framer-motion";

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
	const getLayout =
		Component.getLayout || ((page) => <BaseLayout>{page}</BaseLayout>);
	return (
		<MDXProvider>
			<DefaultSeo
				titleTemplate="%s · matteing.com"
				defaultTitle="Sergio Mattei · matteing.com"
				description="Founder and software engineer"
				canonical="https://matteing.com/"
				openGraph={{
					url: "https://matteing.com/",
					title: "Sergio Mattei · matteing.com",
					description: "Founder and software engineer",
					images: [
						{
							url: "https://matteing.com/og-image.png",
							width: 1200,
							height: 675,
							alt: "Sergio Mattei",
							type: "image/png",
						},
					],
					site_name: "matteing.com",
				}}
				twitter={{
					handle: "@matteing",
					cardType: "summary_large_image",
				}}
			/>
			<LazyMotion features={domAnimation}>
				{getLayout(<Component {...pageProps} />)}
			</LazyMotion>
		</MDXProvider>
	);
}

export default MyApp;
