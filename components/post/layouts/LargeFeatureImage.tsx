import Image from "next/image";
import Body from "../../layout/Body";
import Container from "../../layout/Container";
import { NavPills } from "../../layout/Nav";
import PostTitle from "../PostTitle";
import Prose from "../Prose";
import TestProse from "../TestProse";
import cover from "../../public/magical.jpeg";

export default function LargeFeatureImage() {
	return (
		<Body>
			<div className="relative h-[550px] w-full bg-gray-900">
				<div
					className={
						"dark absolute top-10 z-30 flex w-full justify-center"
					}
				>
					<div className="rounded-full bg-gray-900 bg-opacity-90 p-2 backdrop-blur-xl">
						<NavPills />
					</div>
				</div>
				{/**objectFit should allow contain depending on circumstance -- frontmatter  -- advanced typesetting.**/}
				<Image
					src={cover}
					layout="fill"
					objectFit="cover"
					objectPosition="bottom"
					alt="Title"
				/>
			</div>

			<Container>
				<PostTitle />
				<Prose>
					<TestProse />
				</Prose>
			</Container>
		</Body>
	);
}
