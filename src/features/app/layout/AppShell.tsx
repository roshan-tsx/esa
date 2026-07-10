import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { useCurrentUser } from "~/features/app/hooks/useCurrentUser";
import { ScoreChip } from "~/features/app/ui/ScoreChip";
import { StartupSwitcher } from "~/features/app/ui/StartupSwitcher";
import { UserMenu } from "~/features/app/ui/UserMenu";
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
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const { user: me } = useCurrentUser();
	const isPro = me?.planTier === "pro";

	return (
		<div className="flex min-h-dvh flex-col bg-background text-foreground">
			<header className="sticky top-0 z-50 border-b border-border bg-background">
				<div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
					<div className="flex min-w-0 items-center gap-1 sm:gap-2">
						<Link
							to="/app/dashboard"
							className="shrink-0 text-xl font-semibold tracking-tight sm:text-2xl"
						>
							Engin
						</Link>
						<span
							aria-hidden
							className="hidden h-4 w-px bg-border sm:block"
						/>
						<StartupSwitcher />
					</div>

					<div className="flex shrink-0 items-center gap-2">
						{me ? (
							<>
								<ScoreChip score={me.totalScore} isPro={isPro} />
								{!isPro && (
									<Button asChild size="sm" className="h-8 px-3">
										<Link to="/app/upgrade">Upgrade</Link>
									</Button>
								)}
								{me.name ? (
									<UserMenu
										name={me.name}
										email={me.email}
										image={me.image}
									/>
								) : null}
							</>
						) : null}
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
