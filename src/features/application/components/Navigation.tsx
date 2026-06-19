import { Link, type LinkProps, useLocation } from "@tanstack/react-router";
import { LayoutDashboardIcon, SearchIcon, type LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

type NavItemProps = LinkProps & {
	to: NonNullable<LinkProps["to"]>;
	name: string;
	icon: LucideIcon;
};

const NAV: NavItemProps[] = [
	{ name: "Dashboard", to: "/app/dashboard", icon: LayoutDashboardIcon },
	{ name: "Explore", to: "/app/explore", icon: SearchIcon },
];

function isActive(pathname: string, path: string): boolean {
	return pathname === path || pathname.startsWith(`${path}/`);
}

function NavItem({ name, to, icon: Icon }: NavItemProps) {
	const { pathname } = useLocation();
	const active = isActive(pathname, to);

	return (
		<Link
			to={to}
			className={cn(
				"flex items-center gap-2 px-4 py-2",
				"group relative",
				"text-base font-medium transition-colors duration-200",
				"text-muted-foreground hover:text-foreground",
				active && "text-foreground",
			)}
		>
			<Icon
				className={cn(
					"h-5 w-5 transition-colors duration-200",
					active ? "text-primary" : "group-hover:text-foreground",
				)}
			/>

			<span>{name}</span>

			<span
				className={cn(
					"absolute left-0 right-0 -bottom-1 h-0.5 rounded-full bg-primary",
					"scale-x-0 transition-transform duration-300 origin-center",
					active && "scale-x-100",
				)}
			/>
		</Link>
	);
}

export default function NavigationMenu() {
	return (
		<nav className="hidden md:flex items-center gap-2 px-2">
			{NAV.map((item) => (
				<NavItem key={item.to} {...item} />
			))}
		</nav>
	);
}

export function BottomBar() {
	return (
		<nav className="md:hidden">
			<div className="flex justify-around px-2 py-1">
				{NAV.map((item) => (
					<NavItem key={item.to} {...item} />
				))}
			</div>
		</nav>
	);
}
