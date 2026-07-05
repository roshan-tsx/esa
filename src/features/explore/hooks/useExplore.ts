import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export type ExploreTab = "all" | "startups" | "sprints";

export function useExplore() {
	const [search, setSearch] = useState("");
	const [role, setRole] = useState("");
	const [tab, setTab] = useState<ExploreTab>("all");
	const [pendingSprint, setPendingSprint] = useState<Id<"hiringSprints"> | null>(
		null,
	);

	const results = useQuery(api.explore.search, {
		search: search || undefined,
		role: role || undefined,
		tab,
	});

	const directJoin = useMutation(api.sprints.directJoin);
	const apply = useMutation(api.sprints.apply);

	async function joinSprint(sprintId: Id<"hiringSprints">, phase: string) {
		if (!results?.isAuthenticated) {
			toast.error("Sign in to join sprints");
			return;
		}

		setPendingSprint(sprintId);
		try {
			if (phase === "direct_join") {
				await directJoin({ sprintId });
				toast.success("Joined sprint!");
			} else {
				await apply({ sprintId });
				toast.success("Application submitted");
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Action failed";
			toast.error(message);
		} finally {
			setPendingSprint(null);
		}
	}

	return {
		search,
		setSearch,
		role,
		setRole,
		tab,
		setTab,
		results,
		pendingSprint,
		joinSprint,
	};
}

export function formatTimeLeft(expiresAt: number) {
	const diff = expiresAt - Date.now();
	if (diff <= 0) return "Expired";
	const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
	return `${days}d left`;
}
