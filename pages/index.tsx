import { InferGetStaticPropsType } from "next";
import SpotifyLibrary from "../components/SpotifyLibrary";
import FollowButton from "../components/FollowButton";
import Container from "../components/layout/Container";
import TextLoop from "../components/TextLoop";
import PostGrid from "../components/PostGrid";
import Footer from "../components/layout/Footer";
import { getAllPosts, getBlurPlaceholdersForMany } from "../lib/blog";
import { filterFeaturedPosts } from "../lib/filters";

function Hero() {
	return (
		<div className="helvetica my-32 mx-auto hidden flex-col items-center text-center text-4xl font-bold tracking-tighter md:flex md:text-6xl lg:text-8xl">
			<span className="mb-12">
				Ambitious
				<br />
				<span>
					<TextLoop />
				</span>
			</span>
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
	const featuredPosts = await getBlurPlaceholdersForMany(
		filterFeaturedPosts(await getAllPosts())
	);
	return {
		props: {
			featuredPosts,
		},
	};
}

export default Home;
