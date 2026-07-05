import { useAuthActions } from "@convex-dev/auth/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useCurrentUser } from "~/features/app/hooks/useCurrentUser";
import { NotificationBell } from "~/features/app/ui/NotificationBell";
import { StartupSwitcher } from "~/features/app/ui/StartupSwitcher";
import { initials } from "~/lib/initials";
import { cn } from "~/lib/utils";

const tabs = [
	{
		label: "Tasks",
		to: "/app/dashboard",
		isActive: (path: string) =>
			path.startsWith("/app/dashboard") || path.startsWith("/app/startups"),
	},
	{
		label: "Explore",
		to: "/app/explore",
		isActive: (path: string) => path.startsWith("/app/explore"),
	},
	{
		label: "Sprints",
		to: "/app/sprints",
		isActive: (path: string) => path.startsWith("/app/sprints"),
	},
	{
		label: "Startup",
		to: "/app/startup",
		isActive: (path: string) =>
			path.startsWith("/app/startup") ||
			path.startsWith("/app/pitch") ||
			path.startsWith("/app/team"),
	},
] as const;

export function AppShell({ children }: { readonly children: React.ReactNode }) {
	const { signOut } = useAuthActions();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const { user: me } = useCurrentUser();

	return (
		<div className="flex min-h-dvh flex-col bg-background text-foreground">
			<header className="sticky top-0 z-50 border-b border-border bg-background">
				<div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
					<div className="flex min-w-0 items-center gap-2 sm:gap-3">
						<Link
							to="/app/dashboard"
							className="shrink-0 text-xl font-semibold tracking-tight sm:text-2xl"
						>
							Engin
						</Link>
						<StartupSwitcher />
					</div>

					<div className="flex items-center gap-2 sm:gap-3">
						<NotificationBell />

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="h-10 gap-2 rounded-md px-2"
								>
									<Avatar className="size-7">
										<AvatarFallback className="text-xs">
											{initials(me?.name ?? null, me?.email ?? null)}
										</AvatarFallback>
									</Avatar>
									<span className="hidden max-w-32 truncate text-sm sm:inline">
										{me?.name ?? me?.email ?? "Account"}
									</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-52">
								{me && (
									<div className="px-2 py-2">
										<p className="truncate text-sm font-medium">
											{me.name ?? me.email ?? "User"}
										</p>
										<Badge variant="secondary" className="mt-1 text-xs">
											{me.planTier}
										</Badge>
									</div>
								)}
								<DropdownMenuSeparator />
								{me?.planTier === "free" && (
									<DropdownMenuItem asChild>
										<Link to="/upgrade" className="cursor-pointer">
											Upgrade to Pro
										</Link>
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={() => signOut()}
								>
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				<nav
					aria-label="Main"
					className="grid grid-cols-4 border-t border-border"
				>
					{tabs.map(({ label, to, isActive }) => {
						const active = isActive(pathname);
						return (
							<Button
								key={to}
								asChild
								variant="ghost"
								className={cn(
									"h-auto rounded-none border-b-2 py-3 text-sm font-medium",
									active
										? "border-foreground text-foreground"
										: "border-transparent text-muted-foreground hover:text-foreground",
								)}
							>
								<Link to={to}>{label}</Link>
							</Button>
						);
					})}
				</nav>
			</header>

			<main className="w-full flex-1 px-4 sm:px-6 lg:px-8">{children}</main>
		</div>
	);
}
