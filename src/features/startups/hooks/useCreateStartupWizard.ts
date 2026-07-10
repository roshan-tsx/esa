import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

type StepId = "name" | "building" | "tagline" | "website";

type WizardData = {
	name: string;
	description: string;
	tagline: string;
	website: string;
};

export const createStartupSteps: Array<{
	id: StepId;
	question: string;
	hint?: string;
	placeholder: string;
	multiline?: boolean;
	required?: boolean;
	skippable?: boolean;
}> = [
	{
		id: "name",
		question: "What's it called?",
		placeholder: "Acme",
		required: true,
	},
	{
		id: "building",
		question: "What are you building?",
		hint: "Plain language. No pitch deck yet.",
		placeholder: "We help founders hire in sprints…",
		multiline: true,
	},
	{
		id: "tagline",
		question: "One line pitch?",
		placeholder: "The fast lane for founders",
		skippable: true,
	},
	{
		id: "website",
		question: "Got a website?",
		placeholder: "https://",
		skippable: true,
	},
];

function stepValue(data: WizardData, id: StepId): string {
	switch (id) {
		case "name":
			return data.name;
		case "building":
			return data.description;
		case "tagline":
			return data.tagline;
		case "website":
			return data.website;
	}
}

function setStepValue(data: WizardData, id: StepId, value: string): WizardData {
	switch (id) {
		case "name":
			return { ...data, name: value };
		case "building":
			return { ...data, description: value };
		case "tagline":
			return { ...data, tagline: value };
		case "website":
			return { ...data, website: value };
	}
}

export function useCreateStartupWizard() {
	const navigate = useNavigate();
	const createStartup = useMutation(api.startups.create);
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

	const [stepIndex, setStepIndex] = useState(0);
	const [data, setData] = useState<WizardData>({
		name: "",
		description: "",
		tagline: "",
		website: "",
	});
	const [isPending, setIsPending] = useState(false);

	const step = createStartupSteps[stepIndex];
	const isLast = stepIndex === createStartupSteps.length - 1;
	const value = stepValue(data, step.id);
	const canContinue = !step.required || value.trim().length > 0;

	const goNext = useCallback(() => {
		if (!canContinue || isLast) return;
		setStepIndex((index) => index + 1);
	}, [canContinue, isLast]);

	const goBack = useCallback(() => {
		if (stepIndex === 0) return;
		setStepIndex((index) => index - 1);
	}, [stepIndex]);

	async function create() {
		if (!data.name.trim()) return;

		setIsPending(true);
		try {
			await createStartup({
				name: data.name.trim(),
				description: data.description.trim() || undefined,
				tagline: data.tagline.trim() || undefined,
				website: data.website.trim() || undefined,
			});
			toast.success("Startup created");
			await navigate({ to: "/app/dashboard" });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to create startup";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	}

	function continueStep() {
		if (isLast) {
			void create();
		} else {
			goNext();
		}
	}

	function skipStep() {
		setData((previous) => setStepValue(previous, step.id, ""));
		if (isLast) {
			void create();
		} else {
			setStepIndex((index) => index + 1);
		}
	}

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key === "Enter" && !step.multiline && canContinue) {
			event.preventDefault();
			continueStep();
		}
	}

	function updateValue(nextValue: string) {
		setData((previous) => setStepValue(previous, step.id, nextValue));
	}

	useEffect(() => {
		if (!step.id) {
			return;
		}
		inputRef.current?.focus();
	}, [step.id]);

	return {
		inputRef,
		step,
		stepIndex,
		value,
		canContinue,
		isLast,
		isPending,
		data,
		goBack,
		continueStep,
		skipStep,
		handleKeyDown,
		updateValue,
	};
}
