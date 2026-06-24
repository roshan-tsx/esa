import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { PageLoading } from "~/components/shared/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

type PitchEditorProps = {
	readonly startup: Doc<"startups">;
};

const pitchSections = [
	{ key: "pitchProblem", label: "Problem", placeholder: "What problem are you solving?" },
	{ key: "pitchSolution", label: "Solution", placeholder: "How does your product solve it?" },
	{ key: "pitchMarket", label: "Market", placeholder: "Who is your target market?" },
	{ key: "pitchTraction", label: "Traction", placeholder: "Metrics, milestones, early wins" },
	{ key: "pitchTeam", label: "Team", placeholder: "Who is building this?" },
] as const;

type SectionKey = (typeof pitchSections)[number]["key"];

function PitchPreview({
	name,
	tagline,
	description,
	sections,
}: {
	readonly name: string;
	readonly tagline: string;
	readonly description: string;
	readonly sections: Record<SectionKey, string>;
}) {
	return (
		<div className="rounded-xl border bg-card p-5 space-y-5 text-sm">
			<div className="space-y-2 border-b border-border pb-4">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Preview
				</p>
				<h2 className="text-xl font-bold">{name || "Your startup"}</h2>
				{tagline && <p className="font-medium">{tagline}</p>}
				{description && (
					<p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
				)}
			</div>
			{pitchSections.map(({ key, label }) => {
				const content = sections[key];
				if (!content) return null;
				return (
					<div key={key}>
						<h3 className="font-semibold">{label}</h3>
						<p className="mt-1 text-muted-foreground whitespace-pre-wrap">
							{content}
						</p>
					</div>
				);
			})}
			{!tagline && !description && pitchSections.every((s) => !sections[s.key]) && (
				<p className="text-center text-muted-foreground py-6">
					Start typing to see your pitch preview.
				</p>
			)}
		</div>
	);
}

function PitchEditor({ startup }: PitchEditorProps) {
	const updatePitch = useMutation(api.startups.updatePitch);
	const publishPitch = useMutation(api.startups.publishPitch);
	const unpublishPitch = useMutation(api.startups.unpublishPitch);

	const [tagline, setTagline] = useState(startup.tagline ?? "");
	const [description, setDescription] = useState(startup.description ?? "");
	const [website, setWebsite] = useState(startup.website ?? "");
	const [pitchProblem, setPitchProblem] = useState(startup.pitchProblem ?? "");
	const [pitchSolution, setPitchSolution] = useState(startup.pitchSolution ?? "");
	const [pitchMarket, setPitchMarket] = useState(startup.pitchMarket ?? "");
	const [pitchTraction, setPitchTraction] = useState(startup.pitchTraction ?? "");
	const [pitchTeam, setPitchTeam] = useState(startup.pitchTeam ?? "");
	const [activeSection, setActiveSection] = useState<SectionKey>("pitchProblem");
	const [isSaving, setIsSaving] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);

	const isPublic = startup.isPublic;

	const sectionValues: Record<SectionKey, string> = {
		pitchProblem,
		pitchSolution,
		pitchMarket,
		pitchTraction,
		pitchTeam,
	};

	const sectionSetters: Record<SectionKey, (v: string) => void> = {
		pitchProblem: setPitchProblem,
		pitchSolution: setPitchSolution,
		pitchMarket: setPitchMarket,
		pitchTraction: setPitchTraction,
		pitchTeam: setPitchTeam,
	};

	const filledSections = pitchSections.filter((s) => sectionValues[s.key].trim()).length;
	const basicsFilled = [tagline, description].filter((v) => v.trim()).length;

	async function handleSave(event?: React.FormEvent) {
		event?.preventDefault();

		setIsSaving(true);
		try {
			await updatePitch({
				startupId: startup._id,
				tagline: tagline || undefined,
				description: description || undefined,
				website: website || undefined,
				pitchProblem: pitchProblem || undefined,
				pitchSolution: pitchSolution || undefined,
				pitchMarket: pitchMarket || undefined,
				pitchTraction: pitchTraction || undefined,
				pitchTeam: pitchTeam || undefined,
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

	async function handlePublish() {
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

	async function handleUnpublish() {
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

	return (
		<div className="w-full py-6 space-y-6">
			<div className="-mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 sticky top-[7.5rem] z-40 sm:top-32">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<h1 className="truncate text-lg font-bold">{startup.name}</h1>
							<Badge variant={isPublic ? "default" : "secondary"}>
								{isPublic ? "Live" : "Draft"}
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground">
							{basicsFilled}/2 basics · {filledSections}/5 sections filled
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							size="sm"
							variant="outline"
							disabled={isSaving}
							onClick={() => handleSave()}
						>
							{isSaving ? "Saving..." : "Save"}
						</Button>
						{isPublic ? (
							<>
								<Button
									type="button"
									size="sm"
									variant="outline"
									disabled={isPublishing}
									onClick={handleUnpublish}
								>
									Unpublish
								</Button>
								<Button asChild size="sm" variant="secondary">
									<a
										href={`/s/${startup.slug}`}
										target="_blank"
										rel="noreferrer"
									>
										View live
									</a>
								</Button>
							</>
						) : (
							<Button
								type="button"
								size="sm"
								disabled={isPublishing}
								onClick={handlePublish}
							>
								{isPublishing ? "Publishing..." : "Publish"}
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className="grid gap-8 lg:grid-cols-2">
				<form onSubmit={handleSave} className="space-y-6">
					<section className="space-y-4">
						<h2 className="font-semibold">Basics</h2>
						<div className="space-y-2">
							<Label htmlFor="tagline">Tagline</Label>
							<Input
								id="tagline"
								value={tagline}
								onChange={(e) => setTagline(e.target.value)}
								placeholder="One-line pitch"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="What are you building?"
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="website">Website</Label>
							<Input
								id="website"
								type="url"
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
								placeholder="https://"
							/>
						</div>
					</section>

					<section className="space-y-4">
						<h2 className="font-semibold">Pitch sections</h2>
						<div className="flex flex-wrap gap-2">
							{pitchSections.map(({ key, label }) => (
								<button
									key={key}
									type="button"
									onClick={() => setActiveSection(key)}
									className={cn(
										"rounded-md border px-3 py-1 text-xs font-medium transition-colors",
										activeSection === key
											? "border-foreground bg-muted text-foreground"
											: sectionValues[key].trim()
												? "border-border text-foreground"
												: "border-dashed border-muted-foreground/40 text-muted-foreground",
									)}
								>
									{label}
								</button>
							))}
						</div>
						{pitchSections.map(({ key, label, placeholder }) =>
							activeSection === key ? (
								<div key={key} className="space-y-2">
									<Label htmlFor={key}>{label}</Label>
									<Textarea
										id={key}
										value={sectionValues[key]}
										onChange={(e) => sectionSetters[key](e.target.value)}
										placeholder={placeholder}
										rows={6}
										autoFocus
									/>
								</div>
							) : null,
						)}
					</section>
				</form>

				<div className="lg:sticky lg:top-40 lg:self-start">
					<PitchPreview
						name={startup.name}
						tagline={tagline}
						description={description}
						sections={sectionValues}
					/>
					<p className="mt-3 text-xs text-muted-foreground text-center">
						Public page:{" "}
						<span className="font-mono">/s/{startup.slug}</span>
					</p>
				</div>
			</div>
		</div>
	);
}

export function PitchPage() {
	const startup = useQuery(api.startups.getMine);

	if (startup === undefined) {
		return <PageLoading />;
	}

	if (!startup) {
		return (
			<div className="mx-auto w-full max-w-xl py-16 text-center">
				<h1 className="text-2xl font-bold">Pitch deck</h1>
				<p className="mt-2 text-muted-foreground">
					Create your startup first to build your public pitch page.
				</p>
				<Button asChild className="mt-6">
					<Link to="/app/startups/new">Create startup</Link>
				</Button>
			</div>
		);
	}

	if (startup.role !== "founder") {
		const isPublic = startup.startup.isPublic;
		return (
			<div className="mx-auto w-full max-w-xl py-16 text-center space-y-4">
				<h1 className="text-2xl font-bold">Pitch deck</h1>
				<p className="text-muted-foreground">Only founders can edit the pitch.</p>
				{isPublic ? (
					<Button asChild>
						<a
							href={`/s/${startup.startup.slug}`}
							target="_blank"
							rel="noreferrer"
						>
							View public pitch
						</a>
					</Button>
				) : (
					<p className="text-sm text-muted-foreground">Not published yet.</p>
				)}
			</div>
		);
	}

	return <PitchEditor key={startup.startup._id} startup={startup.startup} />;
}
