import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "@convex/_generated/api";
import { cn } from "~/lib/utils";

type StepId = "name" | "building" | "tagline" | "website";

type WizardData = {
	name: string;
	description: string;
	tagline: string;
	website: string;
};

const STEPS: Array<{
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

function setStepValue(
	data: WizardData,
	id: StepId,
	value: string,
): WizardData {
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

export function CreateStartupPage() {
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

	const step = STEPS[stepIndex];
	const isLast = stepIndex === STEPS.length - 1;
	const value = stepValue(data, step.id);

	const canContinue =
		!step.required || value.trim().length > 0;

	const goNext = useCallback(() => {
		if (!canContinue) return;
		if (isLast) return;
		setStepIndex((i) => i + 1);
	}, [canContinue, isLast]);

	const goBack = useCallback(() => {
		if (stepIndex === 0) return;
		setStepIndex((i) => i - 1);
	}, [stepIndex]);

	async function handleCreate() {
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

	function handleContinue() {
		if (isLast) {
			void handleCreate();
		} else {
			goNext();
		}
	}

	function handleSkip() {
		setData((d) => setStepValue(d, step.id, ""));
		if (isLast) {
			void handleCreate();
		} else {
			setStepIndex((i) => i + 1);
		}
	}

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key === "Enter" && !step.multiline && canContinue) {
			event.preventDefault();
			handleContinue();
		}
	}

	useEffect(() => {
		inputRef.current?.focus();
	}, [step.id]);

	return (
		<div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-2xl flex-col px-2 py-6 sm:py-10">
			<div className="mb-10 flex items-center justify-between gap-4">
				{stepIndex > 0 ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="-ml-2 text-muted-foreground"
						onClick={goBack}
						disabled={isPending}
					>
						<ArrowLeft className="size-4" />
						Back
					</Button>
				) : (
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="-ml-2 text-muted-foreground"
					>
						<Link to="/app/dashboard">Cancel</Link>
					</Button>
				)}

				<div className="flex gap-1.5" aria-hidden>
					{STEPS.map((s, i) => (
						<span
							key={s.id}
							className={cn(
								"h-1 w-6 rounded-full transition-colors",
								i <= stepIndex ? "bg-primary" : "bg-muted",
							)}
						/>
					))}
				</div>

				<span className="w-14 text-right text-xs tabular-nums text-muted-foreground">
					{stepIndex + 1}/{STEPS.length}
				</span>
			</div>

			<div className="flex flex-1 flex-col justify-center pb-16">
				<h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
					{step.question}
				</h1>
				{step.hint && (
					<p className="mt-3 text-base text-muted-foreground sm:text-lg">
						{step.hint}
					</p>
				)}

				<div className="mt-10 sm:mt-12">
					{step.multiline ? (
						<textarea
							ref={inputRef as React.RefObject<HTMLTextAreaElement>}
							value={value}
							onChange={(e) =>
								setData((d) => setStepValue(d, step.id, e.target.value))
							}
							placeholder={step.placeholder}
							rows={4}
							className="w-full resize-none border-0 border-b border-border bg-transparent pb-3 text-xl font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none sm:text-2xl"
						/>
					) : (
						<input
							ref={inputRef as React.RefObject<HTMLInputElement>}
							type={step.id === "website" ? "url" : "text"}
							value={value}
							onChange={(e) =>
								setData((d) => setStepValue(d, step.id, e.target.value))
							}
							onKeyDown={handleKeyDown}
							placeholder={step.placeholder}
							className="w-full border-0 border-b border-border bg-transparent pb-3 text-xl font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none sm:text-2xl"
						/>
					)}
				</div>

				<div className="mt-12 flex flex-wrap items-center gap-3">
					<Button
						size="lg"
						className="rounded-full px-8"
						disabled={!canContinue || isPending}
						onClick={handleContinue}
					>
						{isPending
							? "Creating…"
							: isLast
								? "Launch"
								: "Continue"}
					</Button>
					{step.skippable && (
						<Button
							type="button"
							variant="ghost"
							size="lg"
							className="text-muted-foreground"
							disabled={isPending}
							onClick={handleSkip}
						>
							Skip
						</Button>
					)}
				</div>

				{isLast && data.name.trim() && (
					<p className="mt-8 text-sm text-muted-foreground">
						Launching{" "}
						<span className="font-medium text-foreground">{data.name.trim()}</span>
					</p>
				)}
			</div>
		</div>
	);
}
