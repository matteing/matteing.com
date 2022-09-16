import Image from "next/image";
import Body from "../../layout/Body";
import Container from "../../layout/Container";
import Nav from "../../layout/Nav";
import cover from "../../public/transparent-cover.png";
import Prose from "../Prose";
import PostTitle from "../PostTitle";
import TestProse from "../TestProse";

// TODO: Preserve aspect ratio for MDX images.
// TODO: <div style={{width: '100%', height: '100%', position: 'relative'}}>
// TODO: Fast SyntaxHighlight https://colinhemphill.com/blog/fast-static-syntax-highlighting-for-mdx-in-nextjs

export default function FeatureImage() {
	const featureImage = cover;
	const featureImageFit = "contain";
	const featureImagePosition = "bottom";

	return (
		<Body>
			<Nav />
			<Container>
				<PostTitle className="!mb-10" />
				<figure className="mb-10">
					<div className="relative aspect-video overflow-hidden rounded-xl bg-gray-50">
						<Image
							src={featureImage}
							layout="fill"
							objectFit={featureImageFit}
							objectPosition={featureImagePosition}
							placeholder="blur"
							alt="Title"
						/>
					</div>
				</figure>
				<Prose>
					<TestProse />
				</Prose>
			</Container>
		</Body>
	);
}
