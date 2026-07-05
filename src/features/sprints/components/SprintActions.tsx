import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { Id } from "@convex/_generated/dataModel";

type Application = {
	_id: Id<"sprintApplications">;
	userId: Id<"users">;
	status: string;
	user: { name: string | null; email: string | null } | null;
};

type SprintFounderActionsProps = {
	readonly sprintStatus: string;
	readonly joinedCount: number;
	readonly applications: Application[];
	readonly isPending: boolean;
	readonly onStartSprint: () => void;
	readonly onAccept: (applicationId: Id<"sprintApplications">) => void;
	readonly onReject: (applicationId: Id<"sprintApplications">) => void;
	readonly onHire: (candidateUserId: Id<"users">) => void;
};

export function SprintFounderActions({
	sprintStatus,
	joinedCount,
	applications,
	isPending,
	onStartSprint,
	onAccept,
	onReject,
	onHire,
}: SprintFounderActionsProps) {
	const pendingApplications = applications.filter(
		(app) => app.status === "applied",
	);
	const hireableApplications = applications.filter(
		(app) => app.status === "joined" || app.status === "accepted",
	);

	return (
		<section className="space-y-4 rounded-lg border p-5">
			<h2 className="font-semibold">Founder actions</h2>
			{sprintStatus === "open" && joinedCount > 0 && (
				<Button disabled={isPending} onClick={onStartSprint}>
					Start sprint chat
				</Button>
			)}
			{pendingApplications.length > 0 && (
				<ul className="space-y-2">
					<p className="text-sm font-medium">Pending applications</p>
					{pendingApplications.map((app) => (
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
									onClick={() => onAccept(app._id)}
								>
									Accept
								</Button>
								<Button
									size="sm"
									variant="outline"
									disabled={isPending}
									onClick={() => onReject(app._id)}
								>
									Reject
								</Button>
							</div>
						</li>
					))}
				</ul>
			)}
			{sprintStatus === "active" && hireableApplications.length > 0 && (
				<ul className="space-y-2">
					<p className="text-sm font-medium">Hire from sprint</p>
					{hireableApplications.map((app) => (
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
								onClick={() => onHire(app.userId)}
							>
								Hire
							</Button>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

type SprintJoinSectionProps = {
	readonly phase: string;
	readonly isFull: boolean;
	readonly applicationLimit: { used: number; max: number | null };
	readonly isPending: boolean;
	readonly onDirectJoin: () => void;
	readonly onApply: () => void;
};

export function SprintJoinSection({
	phase,
	isFull,
	applicationLimit,
	isPending,
	onDirectJoin,
	onApply,
}: SprintJoinSectionProps) {
	if (isFull) return null;

	return (
		<section className="space-y-3 rounded-lg border p-5">
			<h2 className="font-semibold">Join this sprint</h2>
			{applicationLimit.max !== null && (
				<p className="text-xs text-muted-foreground">
					{applicationLimit.used}/{applicationLimit.max} applications used today
				</p>
			)}
			{phase === "direct_join" ? (
				<Button disabled={isPending} onClick={onDirectJoin}>
					Join directly
				</Button>
			) : (
				<Button disabled={isPending} onClick={onApply}>
					Apply to join
				</Button>
			)}
		</section>
	);
}

type ApplicationStatusProps = {
	readonly status: string;
};

export function ApplicationStatus({ status }: ApplicationStatusProps) {
	return (
		<section className="rounded-lg border p-5">
			<p className="text-sm">
				Your status: <Badge variant="outline">{status}</Badge>
			</p>
		</section>
	);
}
