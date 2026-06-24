import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { PageLoading } from "~/components/shared/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "@convex/_generated/api";

export function SprintsPage() {
	const startup = useQuery(api.startups.getMine);
	const sprints = useQuery(
		api.sprints.listMine,
		startup?.startup._id ? { startupId: startup.startup._id } : "skip",
	);

	if (startup === undefined) {
		return <PageLoading />;
	}

	if (!startup) {
		return (
			<div className="w-full py-10 text-center">
				<h1 className="text-2xl font-bold">Create a startup</h1>
				<p className="mt-2 text-muted-foreground">
					Post hiring sprints after setting up your startup.
				</p>
				<Button asChild className="mt-6">
					<Link to="/app/startups/new">Create startup</Link>
				</Button>
			</div>
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
		<div className="w-full py-8 space-y-6">
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
				<div className="rounded-lg border border-dashed p-10 text-center space-y-4">
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

export function CreateSprintPage() {
	const navigate = useNavigate();
	const startup = useQuery(api.startups.getMine);
	const createSprint = useMutation(api.sprints.create);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [role, setRole] = useState("");
	const [taskInput, setTaskInput] = useState("");
	const [tasks, setTasks] = useState<string[]>([]);
	const [rankingCriteria, setRankingCriteria] = useState("");
	const [perks, setPerks] = useState("");
	const [isPending, setIsPending] = useState(false);

	function addTask() {
		const trimmed = taskInput.trim();
		if (!trimmed) return;
		setTasks((prev) => [...prev, trimmed]);
		setTaskInput("");
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!startup?.startup._id) return;

		setIsPending(true);
		try {
			const sprintId = await createSprint({
				startupId: startup.startup._id,
				title,
				description,
				role,
				taskTitles: tasks,
				rankingCriteria: rankingCriteria || undefined,
				perks: perks || undefined,
			});
			toast.success("Sprint posted!");
			await navigate({
				to: "/app/sprints/$sprintId",
				params: { sprintId },
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to create sprint";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	}

	if (startup === undefined) return <PageLoading />;

	if (!startup || startup.role !== "founder") {
		return (
			<div className="w-full py-10">
				<p className="text-muted-foreground">Founders only.</p>
			</div>
		);
	}

	return (
		<div className="w-full py-8 space-y-8">
			<div>
				<h1 className="text-2xl font-bold">Post a hiring sprint</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Public for 7 days. Direct join 24h, then apply.
				</p>
			</div>

			<Card className="shadow-none">
				<CardContent className="p-4 sm:p-6">
					<form onSubmit={handleSubmit} className="space-y-5">
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						required
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g. Ship the MVP landing page"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="role">Role</Label>
					<Input
						id="role"
						required
						value={role}
						onChange={(e) => setRole(e.target.value)}
						placeholder="e.g. Frontend engineer"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						required
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="What will candidates work on?"
					/>
				</div>
				<div className="space-y-2">
					<Label>Tasks (public)</Label>
					<div className="flex gap-2">
						<Input
							value={taskInput}
							onChange={(e) => setTaskInput(e.target.value)}
							placeholder="Add a task"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addTask();
								}
							}}
						/>
						<Button type="button" variant="outline" onClick={addTask}>
							Add
						</Button>
					</div>
					{tasks.length > 0 && (
						<ul className="flex flex-wrap gap-2 pt-1">
							{tasks.map((task) => (
								<Badge key={task} variant="secondary">
									{task}
								</Badge>
							))}
						</ul>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="ranking">Ranking criteria</Label>
					<Textarea
						id="ranking"
						value={rankingCriteria}
						onChange={(e) => setRankingCriteria(e.target.value)}
						placeholder="How you'll evaluate candidates"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="perks">Perks</Label>
					<Textarea
						id="perks"
						value={perks}
						onChange={(e) => setPerks(e.target.value)}
						placeholder="Equity, salary, mentorship..."
					/>
				</div>
							<div className="flex flex-col gap-2 sm:flex-row">
								<Button type="submit" disabled={isPending || tasks.length === 0}>
									{isPending ? "Posting..." : "Post sprint"}
								</Button>
								<Button asChild variant="outline">
									<Link to="/app/sprints">Cancel</Link>
								</Button>
							</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
