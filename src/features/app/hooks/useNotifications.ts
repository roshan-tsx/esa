import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export function useNotifications() {
	const invites = useQuery(api.invitations.listMyPendingInvites);
	const acceptInvite = useMutation(api.invitations.acceptInviteById);
	const [acceptingId, setAcceptingId] = useState<Id<"invites"> | null>(null);

	const count = invites?.length ?? 0;

	async function accept(inviteId: Id<"invites">) {
		setAcceptingId(inviteId);
		try {
			await acceptInvite({ inviteId });
			toast.success("Invite accepted — switched to that startup");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to accept invite";
			toast.error(message);
		} finally {
			setAcceptingId(null);
		}
	}

	return {
		invites,
		count,
		acceptingId,
		accept,
	};
}
