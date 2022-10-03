import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import workbooks from "../public/work/workbooks.png";
import juneScreenshot from "../public/work/june-dark.png";
import makerlogScreenshot from "../public/work/makerlog.png";
import roundparcel from "../public/work/roundparcel.png";
import Prose from "../components/Prose";
import Container from "../components/layout/Container";
import { NextSeo } from "next-seo";
import PageTitle from "../components/PageTitle";

// TODO: Make project component with first one -- typography is responsive

export default function Projects() {
	return (
		<Container>
			<NextSeo
				title="Work"
				description="Sergio Mattei's project portfolio."
			/>
			<PageTitle>Work</PageTitle>
			<div className="mt-12">
				<AnimatePresence>
					<m.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="inter mb-24 flex flex-col gap-12 lg:grid lg:grid-cols-2"
					>
						<div className="interactable scalable flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
							<div className="p-6 py-10">
								<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
									2022
								</div>
								<div className="mb-2 text-base font-semibold tracking-tight lg:text-2xl">
									Microsoft Azure
								</div>
								<div className="inter text-base text-gray-500 lg:text-lg">
									Built major features for Azure Portal
								</div>
							</div>
							<div className="relative flex aspect-square items-center overflow-hidden rounded-b-xl bg-gray-50">
								<Image
									layout="fill"
									className="-rotate-6 rounded-lg object-cover"
									placeholder="blur"
									src={workbooks}
									alt="Azure Workbooks Dashboard"
								/>
							</div>
						</div>
						<div className="interactable scalable relative flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
							<div className="p-6 py-10">
								<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
									2022
								</div>
								<div className="mb-2 text-2xl font-semibold tracking-tight">
									June
								</div>
								<div className="inter text-lg text-gray-500">
									Contract engineering for iOS widgets and
									developer docs
								</div>
							</div>
							<div className="relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-b-xl bg-gray-50">
								<Image
									className="z-10"
									layout="fixed"
									placeholder="blur"
									width="520"
									height="520"
									src={juneScreenshot}
									alt=""
								/>
							</div>
						</div>
						<div className="interactable scalable relative col-span-2 flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
							<div className="p-6 py-10">
								<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
									2022
								</div>
								<div className="text-2xl font-semibold tracking-tight">
									Roundparcel
								</div>
								<div className="inter mt-2 text-lg text-gray-500">
									A hosted webhooks SaaS solution⎯coming 2022
								</div>
							</div>
							<div className="relative flex aspect-video flex-col items-center justify-end overflow-hidden rounded-b-xl bg-gray-50">
								<Image
									className="z-10"
									objectFit="contain"
									layout="fill"
									src={roundparcel}
									placeholder="blur"
									alt=""
								/>
							</div>
						</div>
						<div className="interactable scalable relative col-span-2 flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
							<div className="p-6 py-10">
								<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
									2022
								</div>
								<div className="text-2xl font-semibold tracking-tight">
									Makerlog
								</div>
								<div className="inter mt-2 text-lg text-gray-500">
									A community of 6,000+ makers sharing their
									daily tasks publicly
								</div>
							</div>
							<div className="relative flex aspect-video flex-col items-center justify-end overflow-hidden rounded-b-xl bg-gray-50">
								<Image
									className="z-10 object-contain"
									layout="fill"
									placeholder="blur"
									src={makerlogScreenshot}
									alt=""
								/>
							</div>
						</div>
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
						WhatAForums (2010): Quite literally my first ever
						website.
					</li>
				</ul>
			</Prose>
		</Container>
	);
}
