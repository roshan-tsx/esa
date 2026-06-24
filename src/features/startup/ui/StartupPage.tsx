import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { PageLoading } from "~/components/shared/PageLoading";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { api } from "@convex/_generated/api";

export function StartupPage() {
	const startup = useQuery(api.startups.getMine);

	if (startup === undefined) {
		return <PageLoading />;
	}

	if (!startup) {
		return (
			<div className="w-full py-10">
				<h1 className="text-2xl font-bold">Startup</h1>
				<p className="mt-2 text-muted-foreground">
					Create your startup to manage pitch and team.
				</p>
				<Button asChild className="mt-6">
					<Link to="/app/startups/new">Create startup</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full py-8 space-y-8">
			<div>
				<h1 className="text-2xl font-bold">{startup.startup.name}</h1>
				<p className="mt-1 text-muted-foreground">
					Pitch deck and team · {startup.role}
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<Link to="/app/pitch">
					<Card className="h-full py-4 shadow-none transition-colors hover:bg-muted/30">
						<CardContent className="space-y-1 px-4">
							<p className="font-medium">Pitch deck</p>
							<p className="text-sm text-muted-foreground">
								Edit and publish your public landing page.
							</p>
						</CardContent>
					</Card>
				</Link>

				<Link to="/app/team">
					<Card className="h-full py-4 shadow-none transition-colors hover:bg-muted/30">
						<CardContent className="space-y-1 px-4">
							<p className="font-medium">Team</p>
							<p className="text-sm text-muted-foreground">
								Invite members and manage your crew.
							</p>
						</CardContent>
					</Card>
				</Link>
			</div>
		</div>
	);
}
