import { PageLoading } from "~/components/globals/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MemberList } from "~/features/team/components/MemberList";
import { useTeamInvites } from "~/features/team/hooks/useTeamInvites";
import { useWorkspace } from "~/features/app/hooks/useWorkspace";
import { Link } from "@tanstack/react-router";

export function TeamPage() {
	const { isLoading: workspaceLoading } = useWorkspace();
	const {
		startup,
		members,
		invites,
		email,
		setEmail,
		isPending,
		submitInvite,
	} = useTeamInvites();

	if (workspaceLoading) {
		return <PageLoading />;
	}

	if (!startup) {
		return (
			<div className="mx-auto w-full max-w-xl py-16 text-center">
				<h1 className="text-2xl font-bold">Team</h1>
				<p className="mt-2 text-muted-foreground">
					Create your startup first to invite teammates.
				</p>
				<Button asChild className="mt-6">
					<Link to="/app/startups/new">Create startup</Link>
				</Button>
			</div>
		);
	}

	const isFounder = startup.role === "founder";

	return (
		<div className="w-full space-y-6 py-8">
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
								onSubmit={submitInvite}
								className="flex flex-col gap-3 sm:flex-row sm:items-end"
							>
								<div className="flex-1 space-y-2">
									<Label htmlFor="invite-email">Email</Label>
									<Input
										id="invite-email"
										type="email"
										required
										value={email}
										onChange={(event) => setEmail(event.target.value)}
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
											className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3 text-sm"
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
