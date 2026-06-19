import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, GitPullRequestArrowIcon } from "lucide-react";
import { profileQueryOptions } from "~/features/profile/client";
import { cn } from "~/lib/utils";
import { AppAvatar } from "./AppAvatar";
import { HeaderSkeleton } from "./HeaderSkeleton";
import NavigationMenu from "./Navigation";

export function Header() {
	const { pathname } = useLocation();
	const isNotifs = pathname === "/app/notifications";
	const { data: profile, isLoading, isFetching } = useQuery({
		...profileQueryOptions(),
		placeholderData: keepPreviousData,
	});

	if (isLoading) {
		return <HeaderSkeleton />;
	}

	return (
		<div className="flex items-center justify-between px-4">
			<Link to="/" className="flex items-center  gap-2">
				<GitPullRequestArrowIcon className="h-5 text-primary w-5" />
				<span className="font-bold text-xl">ENGIN</span>
			</Link>
			<NavigationMenu />
			<div className="flex items-center gap-2">
				<Link
					to="/app/notifications"
					className={cn(
						isNotifs && "border-b-2 border-primary",
						"text-muted-foreground p-2",
						"transition-all duration-300 ease-in-out",
						"hover:text-foreground hover:-translate-y-1",
					)}
				>
					<Bell className="h-5 w-5" />
				</Link>
				<Link
					to="/app/settings/billing/pro"
					className={cn(
						"flex gap-2 items-center",
						isFetching && "opacity-80 transition-opacity",
					)}
				>
					{profile?.user_type === "basic" ? (
						<div className="px-3 py-1 text-sm rounded-xl border bg-muted/50 text-muted-foreground">
							Basic
						</div>
					) : (
						<div className="px-3 py-1 text-sm rounded-xl bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 shadow-md shadow-blue-500/20">
							Pro
						</div>
					)}
					<AppAvatar />
				</Link>
			</div>
		</div>
	);
}
