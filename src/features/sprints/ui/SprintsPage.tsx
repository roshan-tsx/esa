import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { PageLoading } from "~/components/shared/PageLoading";
import { CreateStartupPrompt } from "~/components/shared/CreateStartupPrompt";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { api } from "@convex/_generated/api";
import { useWorkspace } from "~/features/app/hooks/useWorkspace";

export function SprintsPage() {
	const { active: startup, isLoading } = useWorkspace();
	const sprints = useQuery(
		api.sprints.listMine,
		startup?.startup._id ? { startupId: startup.startup._id } : "skip",
	);

	if (isLoading) {
		return <PageLoading />;
	}

	if (!startup) {
		return (
			<CreateStartupPrompt
				title="Create a startup"
				description="Post hiring sprints after setting up your startup."
			/>
		);
	}

	if (startup.role !== "founder") {
		return (
			<div className="w-full py-10 text-center">
				<h1 className="text-2xl font-bold">Founders only</h1>
				<p className="mt-2 text-muted-foreground">
					Browse and join open sprints in Explore.
				</p>
				<Button asChild className="mt-6">
					<Link to="/app/explore">Explore sprints</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 py-8">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Hiring sprints</h1>
					<p className="text-sm text-muted-foreground">
						{startup.startup.name}
					</p>
				</div>
				<Button asChild>
					<Link to="/app/sprints/new">New sprint</Link>
				</Button>
			</div>

			{sprints === undefined ? (
				<PageLoading rows={3} />
			) : sprints.length === 0 ? (
				<div className="space-y-4 rounded-lg border border-dashed p-10 text-center">
					<p className="text-muted-foreground">No sprints yet.</p>
					<Button asChild>
						<Link to="/app/sprints/new">Create your first sprint</Link>
					</Button>
				</div>
			) : (
				<ul className="space-y-2">
					{sprints.map((sprint) => (
						<li key={sprint._id}>
							<Link to="/app/sprints/$sprintId" params={{ sprintId: sprint._id }}>
								<Card className="gap-0 py-0 shadow-none transition-colors hover:border-primary/30 hover:bg-card/80">
									<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
										<div className="min-w-0">
											<p className="font-medium">{sprint.title}</p>
											<p className="text-sm text-muted-foreground">
												{sprint.role} · {sprint.joinedCount}/
												{sprint.maxCandidates} candidates
											</p>
										</div>
										<div className="flex flex-wrap gap-1.5">
											<Badge variant="outline">{sprint.phase}</Badge>
											<Badge
												variant={
													sprint.status === "active" ? "default" : "secondary"
												}
											>
												{sprint.status}
											</Badge>
										</div>
									</CardContent>
								</Card>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
