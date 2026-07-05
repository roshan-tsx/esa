import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export function useSprintDetail(sprintId: Id<"hiringSprints">) {
	const data = useQuery(api.sprints.get, { sprintId });
	const messages = useQuery(
		api.sprints.listMessages,
		data?.sprint.status === "active" || data?.sprint.status === "completed"
			? { sprintId }
			: "skip",
	);

	const directJoin = useMutation(api.sprints.directJoin);
	const apply = useMutation(api.sprints.apply);
	const startSprint = useMutation(api.sprints.startSprint);
	const acceptApplication = useMutation(api.sprints.acceptApplication);
	const rejectApplication = useMutation(api.sprints.rejectApplication);
	const hire = useMutation(api.sprints.hire);
	const sendMessage = useMutation(api.sprints.sendMessage);

	const [message, setMessage] = useState("");
	const [isPending, setIsPending] = useState(false);

	async function runAction(action: () => Promise<unknown>, successMessage: string) {
		setIsPending(true);
		try {
			await action();
			toast.success(successMessage);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Action failed");
		} finally {
			setIsPending(false);
		}
	}

	const canChat =
		data?.sprint.status === "active" &&
		(data.isFounder ||
			data.myApplication?.status === "joined" ||
			data.myApplication?.status === "accepted");

	return {
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
	};
}
