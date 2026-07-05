import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import {
	pitchSections,
	type PitchFormState,
	type PitchSectionKey,
} from "~/features/pitch/types/pitch";

export function usePitchEditor(startup: Doc<"startups">) {
	const updatePitch = useMutation(api.startups.updatePitch);
	const publishPitch = useMutation(api.startups.publishPitch);
	const unpublishPitch = useMutation(api.startups.unpublishPitch);

	const [form, setForm] = useState<PitchFormState>({
		tagline: startup.tagline ?? "",
		description: startup.description ?? "",
		website: startup.website ?? "",
		pitchProblem: startup.pitchProblem ?? "",
		pitchSolution: startup.pitchSolution ?? "",
		pitchMarket: startup.pitchMarket ?? "",
		pitchTraction: startup.pitchTraction ?? "",
		pitchTeam: startup.pitchTeam ?? "",
	});
	const [activeSection, setActiveSection] = useState<PitchSectionKey>("pitchProblem");
	const [isSaving, setIsSaving] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);

	const sectionValues: Record<PitchSectionKey, string> = {
		pitchProblem: form.pitchProblem,
		pitchSolution: form.pitchSolution,
		pitchMarket: form.pitchMarket,
		pitchTraction: form.pitchTraction,
		pitchTeam: form.pitchTeam,
	};

	const filledSections = pitchSections.filter((section) =>
		sectionValues[section.key].trim(),
	).length;
	const basicsFilled = [form.tagline, form.description].filter((value) =>
		value.trim(),
	).length;

	function updateField<K extends keyof PitchFormState>(key: K, value: PitchFormState[K]) {
		setForm((previous) => ({ ...previous, [key]: value }));
	}

	async function save(event?: React.FormEvent) {
		event?.preventDefault();

		setIsSaving(true);
		try {
			await updatePitch({
				startupId: startup._id,
				tagline: form.tagline || undefined,
				description: form.description || undefined,
				website: form.website || undefined,
				pitchProblem: form.pitchProblem || undefined,
				pitchSolution: form.pitchSolution || undefined,
				pitchMarket: form.pitchMarket || undefined,
				pitchTraction: form.pitchTraction || undefined,
				pitchTeam: form.pitchTeam || undefined,
			});
			toast.success("Pitch saved");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save pitch",
			);
		} finally {
			setIsSaving(false);
		}
	}

	async function publish() {
		setIsPublishing(true);
		try {
			await publishPitch({ startupId: startup._id });
			toast.success("Pitch deck is now public");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to publish",
			);
		} finally {
			setIsPublishing(false);
		}
	}

	async function unpublish() {
		setIsPublishing(true);
		try {
			await unpublishPitch({ startupId: startup._id });
			toast.success("Pitch deck is now private");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to unpublish",
			);
		} finally {
			setIsPublishing(false);
		}
	}

	return {
		form,
		updateField,
		activeSection,
		setActiveSection,
		sectionValues,
		filledSections,
		basicsFilled,
		isSaving,
		isPublishing,
		save,
		publish,
		unpublish,
	};
}
