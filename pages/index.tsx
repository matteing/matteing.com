import { NextPage } from "next";
import SpotifyLibrary from "../components/SpotifyLibrary";
import FollowButton from "../components/FollowButton";
import Nav from "../components/layout/Nav";
import Body from "../components/layout/Body";
import Container from "../components/layout/Container";
import TextLoop from "../components/TextLoop";
import PostGrid from "../components/PostGrid";

function Hero() {
	return (
		<div className="helvetica my-32 mx-auto flex flex-col items-center text-center text-8xl font-bold tracking-tighter">
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

const Home: NextPage = () => {
	return (
		<Body>
			<Container>
				<Nav />
				<Hero />
				<PostGrid />
				<SpotifyLibrary />
			</Container>
		</Body>
	);
};

export default Home;
