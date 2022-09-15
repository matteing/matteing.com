import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function TextLoop() {
	const [index, setIndex] = useState(0);
	const text = [
		"software engineer.",
		"serial entrepreneur.",
		"community builder.",
		"🐶 husky fan.",
		"🇵🇷 desde Borikén.",
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((index) => {
				if (index === text.length - 1) {
					return 0;
				} else {
					return index + 1;
				}
			});
		}, 5000);
		return () => clearInterval(interval);
	});

	return (
		<AnimatePresence initial={false} exitBeforeEnter>
			<motion.div
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -25 }}
				transition={{ duration: 0.15 }}
				key={index}
			>
				{text[index]}
			</motion.div>
		</AnimatePresence>
	);
}
