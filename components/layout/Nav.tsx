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
		className: "md:rounded-l-full",
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
		className: "md:rounded-r-full",
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
					"group flex flex-1 shrink-0 cursor-pointer select-none items-center justify-center py-4 font-medium text-gray-700 transition-all hover:bg-purple-50 dark:text-gray-200 dark:hover:bg-purple-900 dark:hover:bg-opacity-30 md:justify-start md:px-6 " +
					className +
					(router.pathname === href
						? " text-purple-600 dark:text-purple-500"
						: "")
				}
			>
				<div className="flex flex-col items-center text-center transition-all group-active:scale-90 md:flex-row md:text-left">
					{cloneElement((icon as ReactElement) ?? null, {
						className: "mb-1 md:mb-0 md:mr-3 md:h-4 md:w-4 h-6 w-6",
					})}
					<span className="leading-none">{children}</span>
				</div>
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
				"inter interactable flex w-full bg-white transition-colors dark:border-gray-700 dark:bg-gray-800 md:w-auto md:rounded-full md:border md:shadow-sm " +
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

export default function Nav() {
	return (
		<>
			<div className="fixed top-0 left-0 z-20 hidden h-24 w-full bg-white bg-opacity-75 backdrop-blur-xl dark:hidden dark:bg-gray-900 md:block"></div>
			<div className="z-30 flex w-full justify-center dark:static dark:bg-gray-900 md:sticky md:top-6 md:my-12 dark:md:my-0 dark:md:py-12">
				<NavPills />
			</div>
		</>
	);
}
