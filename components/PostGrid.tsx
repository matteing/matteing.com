import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import cover1 from "../public/cover-1.jpeg";
import cover2 from "../public/cover-2.jpeg";

export default function PostGrid() {
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="inter mb-24 grid grid-cols-2 gap-12"
			>
				<div className="interactable scalable flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
					<div className="p-6 py-10">
						<div className="text-2xl font-semibold tracking-tight">
							Thinking Big
						</div>
						<div className="inter mt-2 text-lg text-gray-500">
							I have big news to share: I'm focusing fully on
							Makerlog and putting my all into creator advocacy.
						</div>
					</div>
					<div className="relative flex h-64 items-center overflow-hidden rounded-b-xl">
						<div className="absolute z-0 h-full w-full animate-pulse bg-gray-200"></div>
						<Image
							src={cover1}
							objectFit="cover"
							className="z-10"
							layout="fill"
							alt=""
						/>
					</div>
				</div>
				<div className="interactable scalable relative flex cursor-pointer select-none flex-col rounded-xl border border-gray-100">
					<div className="p-6 py-10">
						<div className="text-2xl font-semibold tracking-tight">
							Doing Whatever I Want
						</div>
						<div className="inter mt-2 text-lg text-gray-500">
							Lately I feel like I've sprung back from years of
							insecurities, fears and pressures.
						</div>
					</div>
					<div className="relative flex h-64 items-center overflow-hidden rounded-b-xl">
						{/** Since this comes from static gen, we can generate placeholders -- getPlaiceholder */}
						<Image
							src={cover2}
							objectFit="cover"
							layout="fill"
							alt=""
						/>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
