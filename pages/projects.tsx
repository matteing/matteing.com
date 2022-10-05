import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import workbooks from "../public/work/workbooks.png";
import juneScreenshot from "../public/work/june-dark.png";
import makerlogScreenshot from "../public/work/makerlog.png";
import roundparcel from "../public/work/roundparcel-logo.png";
import Prose from "../components/Prose";
import Container from "../components/layout/Container";
import { NextSeo } from "next-seo";
import PageTitle from "../components/PageTitle";
import { PropsWithChildren } from "react";
import Link from "next/link";

function ProjectGridItem({
	year,
	title,
	description,
	children,
	className,
	featureImageClassName,
}: PropsWithChildren & {
	year: number | string;
	title: string;
	description: string;
	featureImageClassName?: string;
	className?: string;
}) {
	return (
		<div
			className={`interactable scalable flex cursor-pointer select-none flex-col rounded-xl border border-gray-100 ${className}`}
		>
			<div className="p-6 py-10">
				<small className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400">
					{year}
				</small>
				<h4 className="mb-2">{title}</h4>
				<p className="inter text-base text-gray-500">{description}</p>
			</div>
			<div
				className={`relative flex items-center justify-center overflow-hidden rounded-b-xl bg-gray-50 ${featureImageClassName}`}
			>
				{children}
			</div>
		</div>
	);
}

export default function Projects() {
	return (
		<Container>
			<NextSeo
				title="Projects"
				description="Sergio Mattei's project portfolio."
			/>
			<PageTitle>Projects</PageTitle>
			<div className="mt-12">
				<AnimatePresence>
					<m.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="inter mb-24 flex flex-col gap-12 md:grid-cols-2 lg:grid"
					>
						<ProjectGridItem
							year={2022}
							title="Microsoft Azure"
							description="Built major features for Azure Portal"
							featureImageClassName="aspect-square"
						>
							<Image
								layout="fill"
								className="-rotate-6 scale-[140%]"
								objectFit="cover"
								placeholder="blur"
								src={workbooks}
								alt="Azure Workbooks Dashboard"
							/>
						</ProjectGridItem>
						<ProjectGridItem
							year={2022}
							title="June"
							description="Full-stack contract work"
							featureImageClassName="aspect-square !items-end grow"
						>
							<Image
								className="z-10"
								objectFit="contain"
								placeholder="blur"
								src={juneScreenshot}
								alt="June"
							/>
						</ProjectGridItem>
						<ProjectGridItem
							year={2022}
							title="Roundparcel"
							description="A hosted webhooks SaaS solution⎯coming 2022"
							className="col-span-2"
							featureImageClassName="aspect-video px-8 lg:px-64"
						>
							<Image
								className="z-10"
								objectFit="contain"
								src={roundparcel}
								placeholder="blur"
								alt="Roundparcel"
							/>
						</ProjectGridItem>
						<ProjectGridItem
							year={2022}
							title="Makerlog (sold 2022)"
							description="A community of 6,000+ makers sharing their daily tasks publicly"
							className="col-span-2"
							featureImageClassName="!items-end"
						>
							<Image
								className="z-10"
								objectFit="contain"
								src={makerlogScreenshot}
								placeholder="blur"
								alt="Makerlog"
							/>
						</ProjectGridItem>
						<ProjectGridItem
							year={"2018-2021"}
							title="Streaming on Twitch"
							description="As part of my work at Makerlog, I streamed live coding as a Twitch Partner for many years."
							className="col-span-2"
							featureImageClassName="!items-end"
						>
							<Image
								className="z-10"
								objectFit="contain"
								src={makerlogScreenshot}
								placeholder="blur"
								alt="Makerlog"
							/>
						</ProjectGridItem>
					</m.div>
				</AnimatePresence>
			</div>
			<Prose>
				<h2>Other Projects</h2>
				<p>
					These are some older projects that didn't make the "get a
					full-blown page" treatment.
				</p>
				<ul>
					<li>
						UseIndie (2020): A newsletter for independent product
						creators
					</li>
					<li>
						Cowork (2019): Productivity software for remote teams
					</li>
					<li>Opsbot (2018): Business automation for indie makers</li>
					<li>
						WhatAForums (2010):{" "}
						<Link href="/posts/my-first-website">
							Quite literally my first ever website.
						</Link>
					</li>
				</ul>
			</Prose>
		</Container>
	);
}
