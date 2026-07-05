import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

export function useScores() {
	const score = useQuery(api.scores.getMyScore);
	const leaderboard = useQuery(api.scores.getLeaderboard);
	const claimDaily = useMutation(api.scores.claimDaily);
	const [isClaiming, setIsClaiming] = useState(false);

	async function claim() {
		setIsClaiming(true);
		try {
			const result = await claimDaily();
			toast.success(`+${result.claimed} points. Total: ${result.totalScore}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Claim failed");
		} finally {
			setIsClaiming(false);
		}
	}

	return {
		score,
		leaderboard,
		isClaiming,
		claim,
	};
}
