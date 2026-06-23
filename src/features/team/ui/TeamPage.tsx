import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "@convex/_generated/api";

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
		return (
			<div className="flex h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading team...</p>
			</div>
		);
	}

	if (!startup) {
		return (
			<div className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-10">
				<p className="text-muted-foreground">Create a startup first.</p>
				<Button asChild>
					<Link to="/app/startups/new">Create startup</Link>
				</Button>
			</div>
		);
	}

	if (startup.role !== "founder") {
		return (
			<div className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-10">
				<p className="text-muted-foreground">
					Only founders can manage team invites.
				</p>
				<Button asChild variant="outline">
					<Link to="/app/dashboard">Back to dashboard</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 p-10">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Team</h1>
					<p className="text-muted-foreground">{startup.startup.name}</p>
				</div>
				<Button asChild variant="outline">
					<Link to="/app/dashboard">Dashboard</Link>
				</Button>
			</div>

			<section className="rounded-xl border p-6 space-y-4">
				<h2 className="text-lg font-semibold">Members</h2>
				<ul className="space-y-2">
					{members?.map((member) => (
						<li
							key={member._id}
							className="flex items-center justify-between rounded-lg border px-3 py-2"
						>
							<div>
								<p className="font-medium">
									{member.user.name ?? member.user.email ?? "Member"}
								</p>
								<p className="text-sm text-muted-foreground">
									{member.user.email}
								</p>
							</div>
							<Badge variant="secondary">{member.role}</Badge>
						</li>
					))}
				</ul>
			</section>

			<section className="rounded-xl border p-6 space-y-4">
				<h2 className="text-lg font-semibold">Invite teammate</h2>
				<form onSubmit={handleInvite} className="flex gap-2">
					<div className="flex-1 space-y-2">
						<Label htmlFor="invite-email">Email</Label>
						<Input
							id="invite-email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="teammate@company.com"
						/>
					</div>
					<div className="flex items-end">
						<Button type="submit" disabled={isPending}>
							{isPending ? "Sending..." : "Send invite"}
						</Button>
					</div>
				</form>

				{lastInviteLink && (
					<div className="rounded-lg bg-muted p-3 text-sm break-all">
						<p className="font-medium mb-1">Invite link</p>
						<p>{lastInviteLink}</p>
					</div>
				)}
			</section>

			<section className="rounded-xl border p-6 space-y-3">
				<h2 className="text-lg font-semibold">Pending invites</h2>
				{invites?.length ? (
					<ul className="space-y-2">
						{invites.map((invite) => (
							<li
								key={invite._id}
								className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
							>
								<span>{invite.email}</span>
								<Badge variant="outline">{invite.status}</Badge>
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-muted-foreground">No pending invites.</p>
				)}
			</section>
		</div>
	);
}
