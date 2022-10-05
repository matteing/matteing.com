import "../styles/globals.css";
import BaseLayout from "../components/layout/BaseLayout";
import { AppPropsWithLayout } from "../types";
import { DefaultSeo } from "next-seo";
import { LazyMotion } from "framer-motion";
import { NEXT_PUBLIC_URL } from "../config";

const loadFeatures = () =>
	import("../lib/framer.js").then((res) => res.default);

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
	const getLayout =
		Component.getLayout || ((page) => <BaseLayout>{page}</BaseLayout>);
	return (
		<LazyMotion strict features={loadFeatures}>
			<DefaultSeo
				titleTemplate="%s · matteing.com"
				defaultTitle="Sergio Mattei · matteing.com"
				description="Founder and software engineer"
				canonical={NEXT_PUBLIC_URL}
				openGraph={{
					url: NEXT_PUBLIC_URL,
					title: "Sergio Mattei · matteing.com",
					description: "Founder and software engineer",
					images: [
						{
							url: `${NEXT_PUBLIC_URL}/og-image.png`,
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
			{getLayout(<Component {...pageProps} />)}
		</LazyMotion>
	);
}

export default MyApp;
