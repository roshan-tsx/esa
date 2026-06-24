import { useAuthActions } from "@convex-dev/auth/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "convex/react";
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
import { NotificationBell } from "~/features/app/ui/NotificationBell";
import { StartupSwitcher } from "~/features/app/ui/StartupSwitcher";
import { cn } from "~/lib/utils";
import { api } from "@convex/_generated/api";

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

function initials(name: string | null, email: string | null) {
	const source = name ?? email ?? "?";
	return source.slice(0, 2).toUpperCase();
}

export function AppShell({ children }: { readonly children: React.ReactNode }) {
	const { signOut } = useAuthActions();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const me = useQuery(api.users.getMe);

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
						{me && (
							<Link
								to="/app/scores"
								className="rounded-md border border-border px-3 py-1.5 text-sm font-medium tabular-nums hover:bg-muted/50"
							>
								{me.totalScore} pts
							</Link>
						)}

						<NotificationBell />

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="h-10 gap-2 rounded-md px-2">
									<Avatar className="size-7">
										<AvatarFallback className="text-xs">
											{initials(me?.name ?? null, me?.email ?? null)}
										</AvatarFallback>
									</Avatar>
									<span className="hidden max-w-[8rem] truncate text-sm sm:inline">
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
										<Badge variant="secondary" className="mt-1 text-[10px]">
											{me.planTier}
										</Badge>
									</div>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link to="/app/scores" className="cursor-pointer">
										Scores
									</Link>
								</DropdownMenuItem>
								{me?.planTier === "free" && (
									<DropdownMenuItem asChild>
										<Link to="/pricing" className="cursor-pointer">
											Upgrade to Pro
										</Link>
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={() => signOut()}
								>
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				<nav aria-label="Main" className="grid grid-cols-4 border-t border-border">
					{tabs.map(({ label, to, isActive }) => {
						const active = isActive(pathname);
						return (
							<Link
								key={to}
								to={to}
								className={cn(
									"border-b-2 py-3 text-center text-sm font-medium transition-colors",
									active
										? "border-foreground text-foreground"
										: "border-transparent text-muted-foreground hover:text-foreground",
								)}
							>
								{label}
							</Link>
						);
					})}
				</nav>
			</header>

			<main className="flex-1 w-full px-4 sm:px-6 lg:px-8">{children}</main>
		</div>
	);
}
