import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "@convex/_generated/api";

export function DashboardPage() {
	const me = useQuery(api.users.getMe);
	const startup = useQuery(api.startups.getMine);
	const subscription = useQuery(api.billing.getSubscription);
	const ensureProfile = useMutation(api.users.ensureProfile);
	const { signOut } = useAuthActions();

	useEffect(() => {
		if (me) {
			void ensureProfile();
		}
	}, [me, ensureProfile]);

	if (me === undefined) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-10">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back{me?.name ? `, ${me.name}` : ""}
					</p>
				</div>
				<Button variant="outline" onClick={() => signOut()}>
					Sign out
				</Button>
			</div>

			<section className="rounded-xl border p-6 space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Your plan</h2>
					<Badge variant={subscription?.isPro ? "default" : "secondary"}>
						{subscription?.planTier ?? "free"}
					</Badge>
				</div>
				{!subscription?.isPro && (
					<Button asChild>
						<Link to="/pricing">Upgrade to Pro</Link>
					</Button>
				)}
			</section>

			<section className="rounded-xl border p-6 space-y-4">
				<h2 className="text-lg font-semibold">Your startup</h2>
				{startup === undefined ? (
					<p className="text-muted-foreground">Loading startup...</p>
				) : startup ? (
					<div className="space-y-2">
						<p className="font-medium">{startup.startup.name}</p>
						<p className="text-sm text-muted-foreground">
							{startup.startup.description ?? "No description yet"}
						</p>
						<div className="flex gap-2 pt-2">
							<Button asChild variant="outline">
								<Link to="/app/team">Manage team</Link>
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						<p className="text-muted-foreground">
							Create your startup to get started.
						</p>
						<Button asChild>
							<Link to="/app/startups/new">Create startup</Link>
						</Button>
					</div>
				)}
			</section>

			{me?.email && (
				<p className="text-sm text-muted-foreground">Signed in as {me.email}</p>
			)}
		</div>
	);
}
