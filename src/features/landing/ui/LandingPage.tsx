import { useConvexAuth } from "@convex-dev/auth/react";
import { Navigate } from "@tanstack/react-router";
import { GitPullRequestArrow } from "lucide-react";
import { GoogleButton } from "~/features/auth/ui/GoogleButton";

export function LandingPage() {
	const { isAuthenticated, isLoading } = useConvexAuth();

	if (!isLoading && isAuthenticated) {
		return <Navigate to="/app/dashboard" />;
	}

	return (
		<div className="flex min-h-dvh flex-col ">
			<div className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-10 sm:flex-row sm:gap-16 sm:px-10">
				<div className="flex shrink-0 justify-center sm:flex-1 sm:justify-end">
					<GitPullRequestArrow
						className="size-28 text-primary sm:size-36"
						strokeWidth={2}
						aria-hidden
					/>
				</div>

				<div className="flex w-full max-w-sm flex-col sm:flex-1 sm:max-w-md">
					<h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
						The fast lane for founders
					</h1>
					<p className="mt-3 text-lg font-medium text-primary">
						Move the needle.
					</p>
					<div className="mt-10 w-full max-w-xs">
						<GoogleButton />
					</div>
				</div>
			</div>
		</div>
	);
}
