import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

type FounderDetailsFormProps = {
	readonly sprintId: Id<"hiringSprints">;
	readonly initialRanking: string;
	readonly initialPerks: string;
	readonly disabled: boolean;
};

export function FounderDetailsForm({
	sprintId,
	initialRanking,
	initialPerks,
	disabled,
}: FounderDetailsFormProps) {
	const updateDetails = useMutation(api.sprints.updateDetails);
	const [rankingCriteria, setRankingCriteria] = useState(initialRanking);
	const [perks, setPerks] = useState(initialPerks);
	const [isPending, setIsPending] = useState(false);

	async function save() {
		setIsPending(true);
		try {
			await updateDetails({
				sprintId,
				rankingCriteria: rankingCriteria || undefined,
				perks: perks || undefined,
			});
			toast.success("Details updated");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Update failed",
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<section className="space-y-4 rounded-lg border p-5">
			<h2 className="font-semibold">Sprint details</h2>
			<div className="space-y-2">
				<Label>Ranking criteria</Label>
				<Textarea
					value={rankingCriteria}
					onChange={(event) => setRankingCriteria(event.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Perks</Label>
				<Textarea
					value={perks}
					onChange={(event) => setPerks(event.target.value)}
				/>
			</div>
			<Button
				size="sm"
				variant="outline"
				disabled={disabled || isPending}
				onClick={save}
			>
				Save details
			</Button>
		</section>
	);
}
