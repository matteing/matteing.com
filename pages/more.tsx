import { NextPage } from "next";
import Image from "next/image";
import Container from "../components/layout/Container";
import Prose from "../components/Prose";
import me from "../public/photos/me.jpeg";
import { NextSeo } from "next-seo";

const More: NextPage = () => {
	return (
		<Container>
			<NextSeo
				title="More"
				description="Where to find me, the stack for this website ⎯ and more."
			/>
			<div className="helvetica my-24 mx-auto flex flex-col items-center text-center text-4xl font-bold tracking-tighter md:text-6xl">
				Other Stuff
			</div>
			<div className="mt-12">
				<Prose>
					<p>
						Hi! I'm Sergio Mattei, and this is my personal home on
						the Internet.
					</p>
					<figure>
						<div className="overflow-hidden rounded-lg">
							<Image
								alt="Sergio Mattei"
								src={me}
								layout="responsive"
								placeholder="blur"
							/>
						</div>
						<figcaption className="text-center text-base">
							It's a me
						</figcaption>
					</figure>
					<h2>Stack</h2>
					<p>
						This website is built using the following technologies:
					</p>
					<ul>
						<li>React</li>
						<li>TypeScript</li>
						<li>NextJS</li>
						<li>TailwindCSS</li>
						<li>MDX (via Remark and next-mdx-remote)</li>
					</ul>
					<h2>Contract Work</h2>
					<p>
						If you're interested in hiring me freelance, reach out!
						I specialize in full-stack MVP & side-project
						engineering.
					</p>
					<p>
						Visit my{" "}
						<a
							href="https://twitter.com"
							target="_blank"
							rel="noreferrer"
						>
							Twitter
						</a>{" "}
						and send me a DM!
					</p>
					<h2>Tasks</h2>
					<p>
						Here's a things of things I'd like to do to this website
						in the future.
					</p>
					<ul className="contains-task-list">
						<li className="task-list-item">
							<input type="checkbox" disabled /> Headless CMS? I'd
							like to use Ghost as a backend, but it returns raw
							HTML that I can't mess with without hackery. Custom
							layouts are impossible too.
						</li>
						<li className="task-list-item">
							<input type="checkbox" disabled /> Photography feed
							w/ Masonry
						</li>
					</ul>
					<h2>Other Links</h2>
					<p>These are some other links of interest.</p>
					<ul>
						<li>
							UseIndie (2020): A newsletter for independent
							product creators
						</li>
						<li>
							Cowork (2019): Productivity software for remote
							teams
						</li>
						<li>
							Opsbot (2018): Business automation for indie makers
						</li>
						<li>
							WhatAForums (2010): Quite literally my first ever
							website.
						</li>
					</ul>
				</Prose>
			</div>
		</Container>
	);
};

export default More;
