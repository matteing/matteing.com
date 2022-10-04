import {
	HomeIcon,
	RectangleStackIcon,
	PencilIcon,
	BoltIcon,
} from "@heroicons/react/24/outline";
import { cloneElement, PropsWithChildren, ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export interface RouteDefinition {
	name: string;
	href: string;
	icon: JSX.Element;
	basePath?: boolean;
	className?: string;
}

const ROUTES: RouteDefinition[] = [
	{
		name: "Home",
		href: "/",
		icon: <HomeIcon />,
		className: "rounded-l-full",
	},
	{
		name: "Work",
		href: "/work",
		icon: <RectangleStackIcon />,
	},
	{
		name: "Posts",
		href: "/posts",
		basePath: true,
		icon: <PencilIcon />,
	},
	{
		name: "More",
		href: "/more",
		basePath: false,
		icon: <BoltIcon />,
		className: "rounded-r-full",
	},
];

export function NavItem({
	icon,
	className,
	children,
	href,
}: {
	href: string;
	icon?: JSX.Element;
	className?: string;
	basePath?: boolean;
} & PropsWithChildren) {
	const router = useRouter();

	return (
		<Link href={href}>
			<div
				className={
					"group flex cursor-pointer select-none items-center px-6 py-4 font-medium text-gray-700 transition-all hover:bg-purple-50 dark:text-gray-200 dark:hover:bg-purple-900 dark:hover:bg-opacity-30 " +
					className +
					(router.pathname === href
						? " text-purple-600 dark:text-purple-500"
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

export function MobileNavItem({
	icon,
	children,
	href,
}: {
	href: string;
	icon?: JSX.Element;
	basePath?: boolean;
} & PropsWithChildren) {
	const router = useRouter();

	return (
		<Link href={href}>
			<div
				className={
					"group flex flex-1 shrink-0 cursor-pointer select-none flex-col items-center px-2 py-4 text-xs font-medium text-gray-700 transition-all hover:bg-purple-50 dark:text-gray-200 dark:hover:bg-purple-900 dark:hover:bg-opacity-30 " +
					(router.pathname === href
						? " text-purple-600 dark:text-purple-500"
						: "")
				}
			>
				{cloneElement((icon as ReactElement) ?? null, {
					className: `mb-1 h-6 w-6 text-gray-500 ${
						router.pathname === href
							? " text-purple-600 dark:text-purple-500"
							: ""
					}`,
				})}
				{children}
			</div>
		</Link>
	);
}

export function NavPills({
	className,
}: PropsWithChildren & { className?: string }) {
	return (
		<div
			className={
				"inter interactable flex rounded-full border bg-white shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 " +
				className
			}
		>
			{ROUTES.map((routeProps) => (
				<NavItem key={routeProps.name} {...routeProps}>
					{routeProps.name}
				</NavItem>
			))}
		</div>
	);
}

export function MobileNav() {
	return (
		<div className="left-0 bottom-0 z-50 flex w-full bg-white md:hidden">
			{ROUTES.map((routeProps) => (
				<MobileNavItem key={routeProps.name} {...routeProps}>
					{routeProps.name}
				</MobileNavItem>
			))}
		</div>
	);
}

export default function Nav() {
	return (
		<>
			<div className="fixed top-0 left-0 z-20 hidden h-24 w-full bg-white bg-opacity-75 backdrop-blur-xl md:block"></div>
			<div className="sticky top-6 z-30 my-12 hidden w-full justify-center md:flex">
				<NavPills />
			</div>
			<MobileNav />
		</>
	);
}
