import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useWorkspace } from "~/features/app/hooks/useWorkspace";

export function useDashboardTasks() {
	const { active: startup } = useWorkspace();
	const startupId = startup?.startup._id;

	const me = useQuery(api.users.getMe);
	const members = useQuery(
		api.invitations.listMembers,
		startupId ? { startupId } : "skip",
	);
	const tasks = useQuery(
		api.tasks.list,
		startupId ? { startupId } : "skip",
	);

	const createTask = useMutation(api.tasks.create);
	const removeTask = useMutation(api.tasks.remove);
	const assignToMe = useMutation(api.tasks.assignToMe);
	const toggleComplete = useMutation(api.tasks.toggleComplete);

	const [newTitle, setNewTitle] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [pendingIds, setPendingIds] = useState<Set<Id<"tasks">>>(new Set());

	const openTasks = tasks?.filter((task) => task.status !== "done").slice(0, 5) ?? [];
	const todoCount = tasks?.filter((task) => task.status === "todo").length ?? 0;
	const activeCount =
		tasks?.filter((task) => task.status === "in_progress").length ?? 0;

	function markPending(id: Id<"tasks">, action: () => Promise<unknown>) {
		setPendingIds((previous) => new Set(previous).add(id));
		void action().finally(() => {
			setPendingIds((previous) => {
				const next = new Set(previous);
				next.delete(id);
				return next;
			});
		});
	}

	async function handleCreate(event: React.FormEvent) {
		event.preventDefault();
		if (!startupId || !newTitle.trim()) return;

		setIsCreating(true);
		try {
			await createTask({
				startupId,
				title: newTitle.trim(),
			});
			setNewTitle("");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create task",
			);
		} finally {
			setIsCreating(false);
		}
	}

	return {
		startup,
		me,
		members,
		tasks,
		openTasks,
		todoCount,
		activeCount,
		newTitle,
		setNewTitle,
		isCreating,
		pendingIds,
		markPending,
		handleCreate,
		toggleComplete,
		assignToMe,
		removeTask,
	};
}
