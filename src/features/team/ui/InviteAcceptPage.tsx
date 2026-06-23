import { useConvexAuth } from "@convex-dev/auth/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "@convex/_generated/api";

type InviteAcceptPageProps = {
	readonly token: string;
};

export function InviteAcceptPage({ token }: InviteAcceptPageProps) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const navigate = useNavigate();
	const invite = useQuery(api.invitations.getInviteByToken, { token });
	const acceptInvite = useMutation(api.invitations.acceptInvite);
	const [isPending, setIsPending] = useState(false);

	async function handleAccept() {
		setIsPending(true);
		try {
			await acceptInvite({ token });
			toast.success("Invite accepted");
			await navigate({ to: "/app/dashboard" });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to accept invite";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	}

	if (isLoading || invite === undefined) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading invite...</p>
			</div>
		);
	}

	if (!invite) {
		return (
			<div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-10 text-center">
				<h1 className="text-2xl font-bold">Invite not found</h1>
				<Button asChild>
					<Link to="/">Go home</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 p-10 text-center">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Join {invite.startup?.name}</h1>
				<p className="text-muted-foreground">
					You were invited to join as {invite.invite.role}.
				</p>
			</div>

			{isAuthenticated ? (
				<Button onClick={handleAccept} disabled={isPending}>
					{isPending ? "Joining..." : "Accept invite"}
				</Button>
			) : (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Sign in with {invite.invite.email} to accept this invite.
					</p>
					<Button asChild>
						<Link to="/">Sign in</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
