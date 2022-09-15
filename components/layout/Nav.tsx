import {
	HomeIcon,
	RectangleStackIcon,
	PencilIcon,
	BoltIcon,
} from "@heroicons/react/24/outline";
import { cloneElement, PropsWithChildren, ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";

export function NavItem({
	icon,
	className,
	children,
	href,
}: {
	href: string;
	icon?: JSX.Element;
	className?: string;
} & PropsWithChildren) {
	const router = useRouter();

	return (
		<Link href={href}>
			<div
				className={
					"group flex cursor-pointer select-none items-center px-6 py-4 text-gray-700 transition-all hover:bg-purple-50 " +
					className +
					(router.pathname === href
						? " font-medium text-purple-600"
						: "")
				}
			>
				<div className="flex items-center transition-all group-active:scale-90">
					{cloneElement((icon as ReactElement) ?? null, {
						className: "mr-3 h-4 w-4",
					})}
					<span className="leading-none">{children}</span>
				</div>
			</div>
		</Link>
	);
}

export default function Nav() {
	return (
		<>
			<div className="fixed top-0 left-0 z-20 h-24 w-full bg-white bg-opacity-75 backdrop-blur-xl"></div>
			<div className="sticky top-6 z-30 mt-12 flex w-full justify-center">
				<AnimatePresence initial={false}>
					<motion.div
						key="nav"
						initial={{ opacity: 0, y: -5 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -5, opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="inter interactable flex rounded-full border bg-white shadow-sm transition-all"
					>
						<NavItem
							href="/"
							icon={<HomeIcon />}
							className={"rounded-l-full"}
						>
							Home
						</NavItem>
						<NavItem href="/projects" icon={<RectangleStackIcon />}>
							Work
						</NavItem>
						<NavItem href="/posts" icon={<PencilIcon />}>
							Posts
						</NavItem>
						<NavItem
							href="/more"
							icon={<BoltIcon />}
							className={"rounded-r-full"}
						>
							More
						</NavItem>
					</motion.div>
				</AnimatePresence>
			</div>
		</>
	);
}
