import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

export function useAcceptInvite(token: string) {
	const navigate = useNavigate();
	const invite = useQuery(api.invitations.getInviteByToken, { token });
	const acceptInvite = useMutation(api.invitations.acceptInvite);
	const [isPending, setIsPending] = useState(false);

	async function accept() {
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

	return {
		invite,
		isPending,
		accept,
	};
}
