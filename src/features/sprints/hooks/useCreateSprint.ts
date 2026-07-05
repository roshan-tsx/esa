import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import { useWorkspace } from "~/features/app/hooks/useWorkspace";

export function useCreateSprint() {
	const navigate = useNavigate();
	const { active: startup, isLoading } = useWorkspace();
	const createSprint = useMutation(api.sprints.create);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [role, setRole] = useState("");
	const [taskInput, setTaskInput] = useState("");
	const [tasks, setTasks] = useState<string[]>([]);
	const [rankingCriteria, setRankingCriteria] = useState("");
	const [perks, setPerks] = useState("");
	const [isPending, setIsPending] = useState(false);

	function addTask() {
		const trimmed = taskInput.trim();
		if (!trimmed) return;
		setTasks((previous) => [...previous, trimmed]);
		setTaskInput("");
	}

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		if (!startup?.startup._id) return;

		setIsPending(true);
		try {
			const sprintId = await createSprint({
				startupId: startup.startup._id,
				title,
				description,
				role,
				taskTitles: tasks,
				rankingCriteria: rankingCriteria || undefined,
				perks: perks || undefined,
			});
			toast.success("Sprint posted!");
			await navigate({
				to: "/app/sprints/$sprintId",
				params: { sprintId },
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to create sprint";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	}

	return {
		startup,
		isLoading,
		title,
		setTitle,
		description,
		setDescription,
		role,
		setRole,
		taskInput,
		setTaskInput,
		tasks,
		addTask,
		rankingCriteria,
		setRankingCriteria,
		perks,
		setPerks,
		isPending,
		submit,
	};
}
