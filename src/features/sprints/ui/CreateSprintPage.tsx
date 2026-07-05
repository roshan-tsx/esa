import { Link } from "@tanstack/react-router";
import { PageLoading } from "~/components/shared/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useCreateSprint } from "~/features/sprints/hooks/useCreateSprint";

export function CreateSprintPage() {
	const {
		startup,
		isLoading,
		title,
		setTitle,
		description,
		setDescription,
		role,
		setRole,
		taskInput,
		setTaskInput,
		tasks,
		addTask,
		rankingCriteria,
		setRankingCriteria,
		perks,
		setPerks,
		isPending,
		submit,
	} = useCreateSprint();

	if (isLoading) return <PageLoading />;

	if (!startup || startup.role !== "founder") {
		return (
			<div className="w-full py-10">
				<p className="text-muted-foreground">Founders only.</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-8 py-8">
			<div>
				<h1 className="text-2xl font-bold">Post a hiring sprint</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Public for 7 days. Direct join 24h, then apply.
				</p>
			</div>

			<Card className="shadow-none">
				<CardContent className="p-4 sm:p-6">
					<form onSubmit={submit} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								required
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder="e.g. Ship the MVP landing page"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Input
								id="role"
								required
								value={role}
								onChange={(event) => setRole(event.target.value)}
								placeholder="e.g. Frontend engineer"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								required
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								placeholder="What will candidates work on?"
							/>
						</div>
						<div className="space-y-2">
							<Label>Tasks (public)</Label>
							<div className="flex gap-2">
								<Input
									value={taskInput}
									onChange={(event) => setTaskInput(event.target.value)}
									placeholder="Add a task"
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											event.preventDefault();
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
								onChange={(event) => setRankingCriteria(event.target.value)}
								placeholder="How you'll evaluate candidates"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="perks">Perks</Label>
							<Textarea
								id="perks"
								value={perks}
								onChange={(event) => setPerks(event.target.value)}
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
