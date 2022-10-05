import { InferGetStaticPropsType } from "next";
import SpotifyLibrary from "../components/SpotifyLibrary";
import FollowButton from "../components/FollowButton";
import Container from "../components/layout/Container";
import TextLoop from "../components/TextLoop";
import PostGrid from "../components/PostGrid";
import Footer from "../components/layout/Footer";
import { getBlurFeatureImageForMany, getFeaturedPosts } from "../lib/ghost";

function Hero() {
	return (
		<div className="my-32 mx-auto hidden flex-col items-center text-center md:flex">
			<h1 className="mb-12 text-3xl font-bold tracking-tighter md:text-5xl lg:text-7xl">
				<span>
					Ambitious
					<br />
					<span>
						<TextLoop />
					</span>
				</span>
			</h1>
			<FollowButton />
		</div>
	);
}

function Home({
	featuredPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<Container>
			<div className="block md:hidden">
				<Footer />
			</div>
			<div className="hidden md:block">
				<Hero />
			</div>
			<PostGrid posts={featuredPosts} />
			<SpotifyLibrary />
		</Container>
	);
}

export async function getStaticProps() {
	const featuredPosts = await getBlurFeatureImageForMany(
		await getFeaturedPosts()
	);
	return {
		props: {
			featuredPosts,
		},
	};
}

export default Home;
