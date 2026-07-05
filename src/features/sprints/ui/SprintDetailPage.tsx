import { Link } from "@tanstack/react-router";
import { PageLoading } from "~/components/globals/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FounderDetailsForm } from "~/features/sprints/components/FounderDetailsForm";
import {
	ApplicationStatus,
	SprintFounderActions,
	SprintJoinSection,
} from "~/features/sprints/components/SprintActions";
import { SprintChat } from "~/features/sprints/components/SprintChat";
import { useSprintDetail } from "~/features/sprints/hooks/useSprintDetail";
import type { Id } from "@convex/_generated/dataModel";

type SprintDetailPageProps = {
	readonly sprintId: Id<"hiringSprints">;
};

export function SprintDetailPage({ sprintId }: SprintDetailPageProps) {
	const {
		data,
		messages,
		message,
		setMessage,
		isPending,
		canChat,
		runAction,
		directJoin,
		apply,
		startSprint,
		acceptApplication,
		rejectApplication,
		hire,
		sendMessage,
	} = useSprintDetail(sprintId);

	if (data === undefined) {
		return <PageLoading />;
	}

	const { sprint, myApplication, isFounder, applications, applicationLimit } =
		data;

	return (
		<div className="w-full space-y-6 py-8">
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

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="space-y-6">
					<section className="space-y-3 rounded-lg border p-5">
						<h2 className="font-semibold">About</h2>
						<p className="whitespace-pre-wrap text-sm text-muted-foreground">
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
						<section className="space-y-3 rounded-lg border p-5">
							{sprint.rankingCriteria && (
								<div>
									<h3 className="text-sm font-medium">Ranking criteria</h3>
									<p className="whitespace-pre-wrap text-sm text-muted-foreground">
										{sprint.rankingCriteria}
									</p>
								</div>
							)}
							{sprint.perks && (
								<div>
									<h3 className="text-sm font-medium">Perks</h3>
									<p className="whitespace-pre-wrap text-sm text-muted-foreground">
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

					{!isFounder && !myApplication && (
						<SprintJoinSection
							phase={sprint.phase}
							isFull={sprint.isFull}
							applicationLimit={applicationLimit}
							isPending={isPending}
							onDirectJoin={() =>
								runAction(() => directJoin({ sprintId }), "Joined sprint!")
							}
							onApply={() =>
								runAction(() => apply({ sprintId }), "Application sent")
							}
						/>
					)}

					{myApplication && <ApplicationStatus status={myApplication.status} />}

					{isFounder && (
						<SprintFounderActions
							sprintStatus={sprint.status}
							joinedCount={sprint.joinedCount}
							applications={applications}
							isPending={isPending}
							onStartSprint={() =>
								runAction(
									() => startSprint({ sprintId }),
									"Sprint started — chat is live",
								)
							}
							onAccept={(applicationId) =>
								runAction(
									() => acceptApplication({ applicationId }),
									"Accepted",
								)
							}
							onReject={(applicationId) =>
								runAction(
									() => rejectApplication({ applicationId }),
									"Rejected",
								)
							}
							onHire={(candidateUserId) =>
								runAction(() => hire({ sprintId, candidateUserId }), "Hired!")
							}
						/>
					)}
				</div>

				<SprintChat
					messages={messages}
					message={message}
					canChat={canChat ?? false}
					isPending={isPending}
					onMessageChange={setMessage}
					onSend={() =>
						runAction(async () => {
							await sendMessage({ sprintId, content: message });
							setMessage("");
						}, "Sent")
					}
				/>
			</div>
		</div>
	);
}
