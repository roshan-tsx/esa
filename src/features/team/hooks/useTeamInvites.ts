import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import { useWorkspace } from "~/features/app/hooks/useWorkspace";

export function useTeamInvites() {
	const { active: startup } = useWorkspace();
	const startupId = startup?.startup._id;

	const members = useQuery(
		api.invitations.listMembers,
		startupId ? { startupId } : "skip",
	);
	const invites = useQuery(
		api.invitations.listInvites,
		startupId ? { startupId } : "skip",
	);
	const createInvite = useMutation(api.invitations.createInvite);

	const [email, setEmail] = useState("");
	const [isPending, setIsPending] = useState(false);

	async function submitInvite(event: React.FormEvent) {
		event.preventDefault();
		if (!startupId) return;

		const trimmedEmail = email.trim();
		setIsPending(true);
		try {
			await createInvite({
				startupId,
				email: trimmedEmail,
				role: "member",
			});

			setEmail("");
			toast.success(`Invite sent to ${trimmedEmail}`);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to create invite";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	}

	return {
		startup,
		members,
		invites,
		email,
		setEmail,
		isPending,
		submitInvite,
	};
}
