import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import Image from "next/image";
import workbooks from "../public/workbooks.png";
import juneScreenshot from "../public/june-dark.png";
import makerlogScreenshot from "../public/makerlog.png";
import roundparcel from "../public/roundparcel.png";
import Body from "../components/layout/Body";
import Container from "../components/layout/Container";
import Nav from "../components/layout/Nav";

const Projects: NextPage = () => {
	return (
		<Body>
			<Container>
				<Nav />
				<div className="mt-12">
					<AnimatePresence>
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="inter mb-24 grid grid-cols-2 gap-12"
						>
							<div className="interactable scalable relative col-span-2 flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
								<div className="p-6 py-10">
									<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
										2022
									</div>
									<div className="text-2xl font-semibold tracking-tight">
										Roundparcel
									</div>
									<div className="inter mt-2 text-lg text-gray-500">
										A hosted webhooks SaaS solution⎯coming
										2022
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
							<div className="interactable scalable flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
								<div className="p-6 py-10">
									<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
										2022
									</div>
									<div className="mb-2 text-2xl font-semibold tracking-tight">
										Microsoft Azure
									</div>
									<div className="inter text-lg text-gray-500">
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
										Makerlog
									</div>
									<div className="inter mt-2 text-lg text-gray-500">
										A community of 6,000+ makers sharing
										their daily tasks publicly
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

							<div className="interactable scalable relative col-span-2 flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
								<div className="p-6 py-10">
									<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
										2020
									</div>
									<div className="text-2xl font-semibold tracking-tight">
										UseIndie
									</div>
									<div className="inter mt-2 text-lg text-gray-500">
										A newsletter for independent product
										creators
									</div>
								</div>
							</div>

							<div className="interactable scalable relative col-span-2 flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
								<div className="p-6 py-10">
									<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
										2019
									</div>
									<div className="text-2xl font-semibold tracking-tight">
										Cowork
									</div>
									<div className="inter mt-2 text-lg text-gray-500">
										Productivity software for remote teams
									</div>
								</div>
							</div>
							<div className="interactable scalable relative col-span-2 flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
								<div className="p-6 py-10">
									<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
										2018
									</div>
									<div className="text-2xl font-semibold tracking-tight">
										Opsbot
									</div>
									<div className="inter mt-2 text-lg text-gray-500">
										Explain it
									</div>
								</div>
							</div>
							<div className="interactable scalable relative col-span-2 flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
								<div className="p-6 py-10">
									<div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
										2010
									</div>
									<div className="text-2xl font-semibold tracking-tight">
										My First Website
									</div>
									<div className="inter mt-2 text-lg text-gray-500">
										It's cringe. But I've come a long way.
									</div>
								</div>
							</div>
						</motion.div>
					</AnimatePresence>
				</div>
			</Container>
		</Body>
	);
};

export default Projects;
