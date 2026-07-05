import { useConvexAuth } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { useAcceptInvite } from "~/features/team/hooks/useAcceptInvite";

type InviteAcceptPageProps = {
	readonly token: string;
};

export function InviteAcceptPage({ token }: InviteAcceptPageProps) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const { invite, isPending, accept } = useAcceptInvite(token);

	if (isLoading || invite === undefined) {
		return (
			<div className="flex min-h-dvh items-center justify-center">
				<p className="text-muted-foreground">Loading invite...</p>
			</div>
		);
	}

	if (!invite) {
		return (
			<div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-10 text-center">
				<h1 className="text-2xl font-bold">Invite not found</h1>
				<Button asChild>
					<Link to="/">Go home</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 p-10 text-center">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Join {invite.startup?.name}</h1>
				<p className="text-muted-foreground">
					You were invited to join as {invite.invite.role}.
				</p>
			</div>

			{isAuthenticated ? (
				<Button onClick={accept} disabled={isPending}>
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
