import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { PageLoading } from "~/components/shared/PageLoading";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

function initials(name: string | null, email: string | null) {
	const source = name ?? email ?? "?";
	return source
		.split(" ")
		.map((p) => p[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function EmptyDashboard() {
	return (
		<div className="mx-auto flex w-full max-w-xl flex-col items-center py-16 text-center">
			<h1 className="text-2xl font-bold sm:text-3xl">Create your startup</h1>
			<p className="mt-3 text-muted-foreground">
				Set up your workspace to unlock tasks, pitch deck, team invites, and
				hiring sprints.
			</p>
			<ol className="mt-8 w-full space-y-2 text-left text-sm text-muted-foreground">
				<li className="rounded-lg border px-4 py-3">1. Create your startup workspace</li>
				<li className="rounded-lg border px-4 py-3">2. Invite your team and ship tasks</li>
				<li className="rounded-lg border px-4 py-3">3. Publish your pitch and post hiring sprints</li>
			</ol>
			<Button asChild size="lg" className="mt-8">
				<Link to="/app/startups/new">Create startup</Link>
			</Button>
		</div>
	);
}

function FounderHub() {
	const me = useQuery(api.users.getMe);
	const startup = useQuery(api.startups.getMine);
	const members = useQuery(
		api.invitations.listMembers,
		startup?.startup._id ? { startupId: startup.startup._id } : "skip",
	);
	const tasks = useQuery(
		api.tasks.list,
		startup?.startup._id ? { startupId: startup.startup._id } : "skip",
	);
	const createTask = useMutation(api.tasks.create);
	const removeTask = useMutation(api.tasks.remove);
	const assignToMe = useMutation(api.tasks.assignToMe);
	const toggleComplete = useMutation(api.tasks.toggleComplete);

	const [newTitle, setNewTitle] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [pendingIds, setPendingIds] = useState<Set<Id<"tasks">>>(new Set());

	if (!startup || me === undefined) {
		return <PageLoading />;
	}

	const isFounder = startup.role === "founder";
	const s = startup.startup;
	const openTasks =
		tasks?.filter((t) => t.status !== "done").slice(0, 5) ?? [];
	const todoCount = tasks?.filter((t) => t.status === "todo").length ?? 0;
	const activeCount =
		tasks?.filter((t) => t.status === "in_progress").length ?? 0;

	function markPending(id: Id<"tasks">, fn: () => Promise<unknown>) {
		setPendingIds((prev) => new Set(prev).add(id));
		void fn().finally(() => {
			setPendingIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		});
	}

	async function handleCreate(event: React.FormEvent) {
		event.preventDefault();
		if (!newTitle.trim()) return;

		setIsCreating(true);
		try {
			await createTask({
				startupId: s._id,
				title: newTitle.trim(),
			});
			setNewTitle("");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create task",
			);
		} finally {
			setIsCreating(false);
		}
	}

	const quickLinks = [
		...(isFounder
			? [
					{
						to: "/app/pitch" as const,
						title: "Pitch deck",
						desc: s.isPublic
							? "Public page is live"
							: "Publish your startup story",
					},
				]
			: []),
		{
			to: "/app/team" as const,
			title: "Team",
			desc: `${members?.length ?? 0} members · invite collaborators`,
		},
		...(isFounder
			? [
					{
						to: "/app/sprints/new" as const,
						title: "Hiring sprint",
						desc: "Post a sprint and hire talent",
					},
				]
			: []),
		{
			to: "/app/explore" as const,
			title: "Explore",
			desc: "Discover startups and open sprints",
		},
	];

	return (
		<div className="w-full py-8 space-y-8">
			<div className="space-y-1">
				<p className="text-sm text-muted-foreground">
					{isFounder ? "Founder dashboard" : "Team dashboard"}
				</p>
				<h1 className="text-2xl font-bold sm:text-3xl">{s.name}</h1>
				<p className="text-muted-foreground">
					Manage your startup, team, and shipping velocity.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div className="rounded-lg border px-4 py-3">
					<p className="text-xs text-muted-foreground">Open tasks</p>
					<p className="text-2xl font-semibold tabular-nums">
						{todoCount + activeCount}
					</p>
				</div>
				<div className="rounded-lg border px-4 py-3">
					<p className="text-xs text-muted-foreground">Team</p>
					<p className="text-2xl font-semibold tabular-nums">
						{members?.length ?? "—"}
					</p>
				</div>
				<div className="rounded-lg border px-4 py-3">
					<p className="text-xs text-muted-foreground">Pitch</p>
					<p className="mt-1 text-sm font-medium">
						{s.isPublic ? "Live" : "Draft"}
					</p>
				</div>
				<div className="rounded-lg border px-4 py-3">
					<p className="text-xs text-muted-foreground">Score</p>
					<p className="text-2xl font-semibold tabular-nums">
						{me?.totalScore ?? 0}
					</p>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{quickLinks.map((link) => (
					<Link key={link.to} to={link.to}>
						<Card className="h-full py-4 shadow-none transition-colors hover:bg-muted/30">
							<CardContent className="space-y-1 px-4">
								<p className="font-medium">{link.title}</p>
								<p className="text-sm text-muted-foreground">{link.desc}</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			<section className="space-y-4">
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-lg font-semibold">Tasks</h2>
					<Badge variant="secondary">{tasks?.length ?? 0} total</Badge>
				</div>

				<form
					onSubmit={handleCreate}
					className="flex flex-col gap-2 sm:flex-row"
				>
					<Input
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						placeholder="What needs to get done?"
						className="h-11 flex-1"
					/>
					<Button
						type="submit"
						disabled={isCreating || !newTitle.trim()}
						className="h-11 sm:px-6"
					>
						Add task
					</Button>
				</form>

				{tasks === undefined ? (
					<PageLoading rows={3} />
				) : openTasks.length === 0 ? (
					<p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
						No open tasks. Add one above to get your team moving.
					</p>
				) : (
					<ul className="space-y-2">
						{openTasks.map((task) => {
							const isPending = pendingIds.has(task._id);
							const isMine = task.assignee?._id === me?._id;

							return (
								<li key={task._id}>
									<Card className="gap-0 py-0 shadow-none">
										<CardContent className="flex items-center gap-3 p-4">
											<button
												type="button"
												disabled={isPending}
												onClick={() =>
													markPending(task._id, () =>
														toggleComplete({ taskId: task._id }),
													)
												}
												className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border hover:border-foreground"
												aria-label="Mark complete"
											/>
											<p className="min-w-0 flex-1 font-medium leading-snug">
												{task.title}
											</p>
											<div className="flex items-center gap-2">
												{task.assignee ? (
													<Avatar className="size-6">
														<AvatarFallback className="text-[9px]">
															{initials(
																task.assignee.name,
																task.assignee.email,
															)}
														</AvatarFallback>
													</Avatar>
												) : (
													<Button
														type="button"
														size="sm"
														variant="outline"
														disabled={isPending}
														onClick={() =>
															markPending(task._id, () =>
																assignToMe({ taskId: task._id }),
															)
														}
													>
														Assign me
													</Button>
												)}
												{isMine && task.status === "in_progress" && (
													<Badge variant="outline">Active</Badge>
												)}
												<Button
													type="button"
													size="sm"
													variant="ghost"
													disabled={isPending}
													onClick={() =>
														markPending(task._id, async () => {
															await removeTask({ taskId: task._id });
															toast.success("Task deleted");
														})
													}
												>
													Delete
												</Button>
											</div>
										</CardContent>
									</Card>
								</li>
							);
						})}
					</ul>
				)}

				{(tasks?.length ?? 0) > 5 && (
					<p className="text-center text-sm text-muted-foreground">
						Showing 5 open tasks · {(tasks?.length ?? 0) - openTasks.length} more
						completed or hidden
					</p>
				)}
			</section>

			{me?.planTier === "free" && isFounder && (
				<Card className="shadow-none">
					<CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-medium">Upgrade to Pro</p>
							<p className="text-sm text-muted-foreground">
								Unlimited sprint applications, hiring chat, and direct hire.
							</p>
						</div>
						<Button asChild variant="outline">
							<Link to="/pricing">See pricing</Link>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export function DashboardPage() {
	const startup = useQuery(api.startups.getMine);

	if (startup === undefined) {
		return <PageLoading />;
	}

	if (!startup) {
		return <EmptyDashboard />;
	}

	return <FounderHub />;
}
