import { useConvexAuth } from "@convex-dev/auth/react";
import { Link, Navigate } from "@tanstack/react-router";
import { GitPullRequestArrow } from "lucide-react";
import { GlobalSpinner } from "~/components/globals/GlobalSpinner";
import { Button } from "~/components/ui/button";
import { GoogleButton } from "~/features/auth/ui/GoogleButton";

export function LandingPage() {
	const { isAuthenticated, isLoading } = useConvexAuth();

	if (isLoading) {
		return <GlobalSpinner />;
	}

	if (isAuthenticated) {
		return <Navigate to="/app/dashboard" />;
	}

	return (
		<div className="flex min-h-dvh flex-col bg-background text-foreground">
			<header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8">
				<Link to="/" className="text-xl font-semibold sm:text-2xl">
					Engin
				</Link>
				<div className="flex items-center gap-2">
					<Button asChild variant="ghost" size="sm">
						<Link to="/explore">Explore</Link>
					</Button>
					<Button asChild variant="ghost" size="sm">
						<Link to="/pricing">Pricing</Link>
					</Button>
				</div>
			</header>

			<main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
				<div className="grid w-full max-w-4xl grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
					<div className="flex justify-center md:justify-end">
						<GitPullRequestArrow
							className="size-28 text-primary sm:size-36"
							strokeWidth={2}
							aria-hidden
						/>
					</div>

					<div className="flex flex-col items-center text-center md:items-start md:text-left">
						<h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
							Ship faster. Hire smarter.
						</h1>
						<p className="mt-3 max-w-md text-lg text-muted-foreground">
							Launch your pitch, post hiring sprints, and find builders — free
							to start.
						</p>
						<div className="mt-10 w-full max-w-xs space-y-2">
							<GoogleButton label="Start building free" />
							<p className="text-xs text-muted-foreground">
								No credit card required
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
