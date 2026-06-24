import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { PageLoading } from "~/components/shared/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "@convex/_generated/api";

function MemberList({
	members,
}: {
	readonly members: Array<{
		_id: string;
		role: string;
		user: { name: string | null; email: string | null };
	}>;
}) {
	return (
		<ul className="space-y-2">
			{members?.map((member) => (
				<li key={member._id}>
					<Card className="gap-0 py-0 shadow-none">
						<CardContent className="flex items-center justify-between gap-3 p-4">
							<div className="min-w-0">
								<p className="truncate font-medium">
									{member.user.name ?? member.user.email ?? "Member"}
								</p>
								<p className="truncate text-sm text-muted-foreground">
									{member.user.email}
								</p>
							</div>
							<Badge variant="secondary" className="shrink-0">
								{member.role}
							</Badge>
						</CardContent>
					</Card>
				</li>
			))}
		</ul>
	);
}

export function TeamPage() {
	const startup = useQuery(api.startups.getMine);
	const members = useQuery(
		api.invitations.listMembers,
		startup?.startup._id ? { startupId: startup.startup._id } : "skip",
	);
	const invites = useQuery(
		api.invitations.listInvites,
		startup?.startup._id ? { startupId: startup.startup._id } : "skip",
	);
	const createInvite = useMutation(api.invitations.createInvite);

	const [email, setEmail] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);

	async function handleInvite(event: React.FormEvent) {
		event.preventDefault();
		if (!startup?.startup._id) return;

		setIsPending(true);
		try {
			const result = await createInvite({
				startupId: startup.startup._id,
				email,
				role: "member",
			});

			if (result.token) {
				const link = `${window.location.origin}/invite/${result.token}`;
				setLastInviteLink(link);
			}

			setEmail("");
			toast.success("Invite created");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to create invite";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	}

	if (startup === undefined) {
		return <PageLoading />;
	}

	if (!startup) {
		return (
			<div className="w-full py-10 text-center">
				<h1 className="text-2xl font-bold">Create a startup first</h1>
				<Button asChild className="mt-6">
					<Link to="/app/startups/new">Create startup</Link>
				</Button>
			</div>
		);
	}

	const isFounder = startup.role === "founder";

	return (
		<div className="w-full py-8 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Team</h1>
				<p className="text-sm text-muted-foreground">{startup.startup.name}</p>
			</div>

				<Card className="border-border/60 shadow-none">
					<CardHeader>
						<CardTitle className="text-base">Members</CardTitle>
					</CardHeader>
					<CardContent>
						<MemberList members={members ?? []} />
					</CardContent>
				</Card>

				{isFounder && (
					<>
						<Card className="border-border/60 shadow-none">
							<CardHeader>
								<CardTitle className="text-base">Invite teammate</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<form
									onSubmit={handleInvite}
									className="flex flex-col gap-3 sm:flex-row sm:items-end"
								>
									<div className="flex-1 space-y-2">
										<Label htmlFor="invite-email">Email</Label>
										<Input
											id="invite-email"
											type="email"
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="teammate@company.com"
											className="h-11"
										/>
									</div>
									<Button
										type="submit"
										disabled={isPending}
										className="h-11 sm:px-6"
									>
										{isPending ? "Sending..." : "Send invite"}
									</Button>
								</form>

								{lastInviteLink && (
									<div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm break-all">
										<p className="mb-1 font-medium">Invite link</p>
										<p className="text-muted-foreground">{lastInviteLink}</p>
									</div>
								)}
							</CardContent>
						</Card>

						<Card className="border-border/60 shadow-none">
							<CardHeader>
								<CardTitle className="text-base">Pending invites</CardTitle>
							</CardHeader>
							<CardContent>
								{invites?.length ? (
									<ul className="space-y-2">
										{invites.map((invite) => (
											<li
												key={invite._id}
												className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 text-sm"
											>
												<span className="truncate">{invite.email}</span>
												<Badge variant="outline" className="shrink-0">
													{invite.status}
												</Badge>
											</li>
										))}
									</ul>
								) : (
									<p className="text-sm text-muted-foreground">
										No pending invites.
									</p>
								)}
							</CardContent>
						</Card>
					</>
				)}
		</div>
	);
}
