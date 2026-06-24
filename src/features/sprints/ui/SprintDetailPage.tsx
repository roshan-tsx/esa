import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { PageLoading } from "~/components/shared/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

type SprintDetailPageProps = {
	readonly sprintId: Id<"hiringSprints">;
};

function FounderDetailsForm({
	sprintId,
	initialRanking,
	initialPerks,
	disabled,
}: {
	readonly sprintId: Id<"hiringSprints">;
	readonly initialRanking: string;
	readonly initialPerks: string;
	readonly disabled: boolean;
}) {
	const updateDetails = useMutation(api.sprints.updateDetails);
	const [rankingCriteria, setRankingCriteria] = useState(initialRanking);
	const [perks, setPerks] = useState(initialPerks);
	const [isPending, setIsPending] = useState(false);

	return (
		<section className="rounded-xl border p-5 space-y-4">
			<h2 className="font-semibold">Sprint details</h2>
			<div className="space-y-2">
				<Label>Ranking criteria</Label>
				<Textarea
					value={rankingCriteria}
					onChange={(e) => setRankingCriteria(e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Perks</Label>
				<Textarea value={perks} onChange={(e) => setPerks(e.target.value)} />
			</div>
			<Button
				size="sm"
				variant="outline"
				disabled={disabled || isPending}
				onClick={async () => {
					setIsPending(true);
					try {
						await updateDetails({
							sprintId,
							rankingCriteria: rankingCriteria || undefined,
							perks: perks || undefined,
						});
						toast.success("Details updated");
					} catch (error) {
						toast.error(
							error instanceof Error ? error.message : "Update failed",
						);
					} finally {
						setIsPending(false);
					}
				}}
			>
				Save details
			</Button>
		</section>
	);
}

export function SprintDetailPage({ sprintId }: SprintDetailPageProps) {
	const data = useQuery(api.sprints.get, { sprintId });
	const messages = useQuery(
		api.sprints.listMessages,
		data?.sprint.status === "active" || data?.sprint.status === "completed"
			? { sprintId }
			: "skip",
	);

	const directJoin = useMutation(api.sprints.directJoin);
	const apply = useMutation(api.sprints.apply);
	const startSprint = useMutation(api.sprints.startSprint);
	const acceptApplication = useMutation(api.sprints.acceptApplication);
	const rejectApplication = useMutation(api.sprints.rejectApplication);
	const hire = useMutation(api.sprints.hire);
	const sendMessage = useMutation(api.sprints.sendMessage);

	const [message, setMessage] = useState("");
	const [isPending, setIsPending] = useState(false);

	async function runAction(fn: () => Promise<unknown>, successMsg: string) {
		setIsPending(true);
		try {
			await fn();
			toast.success(successMsg);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Action failed");
		} finally {
			setIsPending(false);
		}
	}

	if (data === undefined) {
		return <PageLoading />;
	}

	const { sprint, myApplication, isFounder, applications, applicationLimit } =
		data;

	const canChat =
		sprint.status === "active" &&
		(isFounder ||
			myApplication?.status === "joined" ||
			myApplication?.status === "accepted");

	return (
		<div className="w-full py-8 space-y-6">
			<Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
				<Link to={isFounder ? "/app/sprints" : "/app/explore"}>Back</Link>
			</Button>

			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">{sprint.title}</h1>
					<p className="text-sm text-muted-foreground">
						{sprint.startupName} · {sprint.role}
					</p>
				</div>
				<div className="flex flex-wrap gap-1.5">
					<Badge>{sprint.status}</Badge>
					<Badge variant="outline">
						{sprint.joinedCount}/{sprint.maxCandidates}
					</Badge>
					<Badge variant="secondary">{sprint.phase}</Badge>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-6">
					<section className="rounded-xl border p-5 space-y-3">
						<h2 className="font-semibold">About</h2>
						<p className="text-sm text-muted-foreground whitespace-pre-wrap">
							{sprint.description}
						</p>
						<div className="flex flex-wrap gap-2">
							{sprint.taskTitles.map((task) => (
								<Badge key={task} variant="secondary">
									{task}
								</Badge>
							))}
						</div>
					</section>

					{(sprint.rankingCriteria || sprint.perks) && (
						<section className="rounded-xl border p-5 space-y-3">
							{sprint.rankingCriteria && (
								<div>
									<h3 className="text-sm font-medium">Ranking criteria</h3>
									<p className="text-sm text-muted-foreground whitespace-pre-wrap">
										{sprint.rankingCriteria}
									</p>
								</div>
							)}
							{sprint.perks && (
								<div>
									<h3 className="text-sm font-medium">Perks</h3>
									<p className="text-sm text-muted-foreground whitespace-pre-wrap">
										{sprint.perks}
									</p>
								</div>
							)}
						</section>
					)}

					{isFounder && sprint.status === "open" && (
						<FounderDetailsForm
							key={sprint._id}
							sprintId={sprintId}
							initialRanking={sprint.rankingCriteria ?? ""}
							initialPerks={sprint.perks ?? ""}
							disabled={isPending}
						/>
					)}

					{!isFounder && !myApplication && !sprint.isFull && (
						<section className="rounded-xl border p-5 space-y-3">
							<h2 className="font-semibold">Join this sprint</h2>
							{applicationLimit.max !== null && (
								<p className="text-xs text-muted-foreground">
									{applicationLimit.used}/{applicationLimit.max} applications
									used today
								</p>
							)}
							{sprint.phase === "direct_join" ? (
								<Button
									disabled={isPending}
									onClick={() =>
										runAction(
											() => directJoin({ sprintId }),
											"Joined sprint!",
										)
									}
								>
									Join directly
								</Button>
							) : (
								<Button
									disabled={isPending}
									onClick={() =>
										runAction(() => apply({ sprintId }), "Application sent")
									}
								>
									Apply to join
								</Button>
							)}
						</section>
					)}

					{myApplication && (
						<section className="rounded-xl border p-5">
							<p className="text-sm">
								Your status:{" "}
								<Badge variant="outline">{myApplication.status}</Badge>
							</p>
						</section>
					)}

					{isFounder && (
						<section className="rounded-xl border p-5 space-y-4">
							<h2 className="font-semibold">Founder actions</h2>
							{sprint.status === "open" && sprint.joinedCount > 0 && (
								<Button
									disabled={isPending}
									onClick={() =>
										runAction(
											() => startSprint({ sprintId }),
											"Sprint started — chat is live",
										)
									}
								>
									Start sprint chat
								</Button>
							)}
							{applications.filter((a) => a.status === "applied").length > 0 && (
								<ul className="space-y-2">
									<p className="text-sm font-medium">Pending applications</p>
									{applications
										.filter((a) => a.status === "applied")
										.map((app) => (
											<li
												key={app._id}
												className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
											>
												<span>
													{app.user?.name ?? app.user?.email ?? "Candidate"}
												</span>
												<div className="flex gap-2">
													<Button
														size="sm"
														disabled={isPending}
														onClick={() =>
															runAction(
																() =>
																	acceptApplication({
																		applicationId: app._id,
																	}),
																"Accepted",
															)
														}
													>
														Accept
													</Button>
													<Button
														size="sm"
														variant="outline"
														disabled={isPending}
														onClick={() =>
															runAction(
																() =>
																	rejectApplication({
																		applicationId: app._id,
																	}),
																"Rejected",
															)
														}
													>
														Reject
													</Button>
												</div>
											</li>
										))}
								</ul>
							)}
							{sprint.status === "active" && (
								<ul className="space-y-2">
									<p className="text-sm font-medium">Hire from sprint</p>
									{applications
										.filter(
											(a) =>
												a.status === "joined" || a.status === "accepted",
										)
										.map((app) => (
											<li
												key={app._id}
												className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
											>
												<span>
													{app.user?.name ?? app.user?.email ?? "Candidate"}
												</span>
												<Button
													size="sm"
													disabled={isPending}
													onClick={() =>
														runAction(
															() =>
																hire({
																	sprintId,
																	candidateUserId: app.userId,
																}),
															"Hired!",
														)
													}
												>
													Hire
												</Button>
											</li>
										))}
								</ul>
							)}
						</section>
					)}
				</div>

				<section className="flex flex-col rounded-xl border">
					<div className="border-b px-4 py-3">
						<h2 className="font-semibold">Sprint chat</h2>
						<p className="text-xs text-muted-foreground">
							{canChat
								? "Chat with candidates"
								: "Available when sprint is active"}
						</p>
					</div>
					<div className="flex-1 space-y-3 overflow-auto p-4 min-h-[300px]">
						{messages === undefined ? (
							<p className="text-sm text-muted-foreground">Loading...</p>
						) : messages.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								No messages yet
							</p>
						) : (
							messages.map((msg) => (
								<div key={msg._id} className="rounded-lg bg-muted/50 px-3 py-2">
									<p className="text-xs font-medium">
										{msg.user?.name ?? msg.user?.email ?? "User"}
									</p>
									<p className="text-sm mt-0.5">{msg.content}</p>
								</div>
							))
						)}
					</div>
					{canChat && (
						<form
							className="flex gap-2 border-t p-3"
							onSubmit={(e) => {
								e.preventDefault();
								if (!message.trim()) return;
								runAction(async () => {
									await sendMessage({ sprintId, content: message });
									setMessage("");
								}, "Sent");
							}}
						>
							<Input
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="Ask a question..."
								className="rounded-full"
							/>
							<Button type="submit" disabled={isPending}>
								Send
							</Button>
						</form>
					)}
				</section>
			</div>
		</div>
	);
}
