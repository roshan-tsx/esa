import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageLoading } from "~/components/globals/PageLoading";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useDashboardTasks } from "~/features/dashboard/hooks/useDashboardTasks";
import { initials } from "~/lib/initials";

export function FounderHub() {
	const {
		startup,
		me,
		members,
		tasks,
		openTasks,
		todoCount,
		activeCount,
		newTitle,
		setNewTitle,
		isCreating,
		pendingIds,
		markPending,
		handleCreate,
		toggleComplete,
		assignToMe,
		removeTask,
	} = useDashboardTasks();

	if (!startup || me === undefined) {
		return <PageLoading />;
	}

	const isFounder = startup.role === "founder";
	const startupDoc = startup.startup;

	const quickLinks = [
		...(isFounder
			? [
					{
						to: "/app/pitch" as const,
						title: "Pitch deck",
						desc: startupDoc.isPublic
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
		<div className="w-full space-y-8 py-8">
			<div className="space-y-1">
				<p className="text-sm text-muted-foreground">
					{isFounder ? "Founder dashboard" : "Team dashboard"}
				</p>
				<h1 className="text-2xl font-bold sm:text-3xl">{startupDoc.name}</h1>
				<p className="text-muted-foreground">
					Manage your startup, team, and shipping velocity.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
						{startupDoc.isPublic ? "Live" : "Draft"}
					</p>
				</div>
				<div className="rounded-lg border px-4 py-3">
					<p className="text-xs text-muted-foreground">Score</p>
					<p className="text-2xl font-semibold tabular-nums">
						{me?.totalScore ?? 0}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
						onChange={(event) => setNewTitle(event.target.value)}
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
											<Button
												type="button"
												variant="outline"
												size="icon-sm"
												disabled={isPending}
												onClick={() =>
													markPending(task._id, () =>
														toggleComplete({ taskId: task._id }),
													)
												}
												className="size-5 shrink-0 rounded-full"
												aria-label="Mark complete"
											/>
											<p className="min-w-0 flex-1 font-medium leading-snug">
												{task.title}
											</p>
											<div className="flex items-center gap-2">
												{task.assignee ? (
													<Avatar className="size-6">
														<AvatarFallback className="text-xs">
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
						Showing 5 open tasks · {(tasks?.length ?? 0) - openTasks.length}{" "}
						more completed or hidden
					</p>
				)}
			</section>
		</div>
	);
}
