import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { PitchPreview } from "~/features/pitch/components/PitchPreview";
import { usePitchEditor } from "~/features/pitch/hooks/usePitchEditor";
import { pitchSections } from "~/features/pitch/types/pitch";
import { cn } from "~/lib/utils";
import type { Doc } from "@convex/_generated/dataModel";

type PitchEditorProps = {
	readonly startup: Doc<"startups">;
};

export function PitchEditor({ startup }: PitchEditorProps) {
	const {
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
	} = usePitchEditor(startup);

	const isPublic = startup.isPublic;

	return (
		<div className="w-full space-y-6 py-6">
			<div className="sticky top-28 z-40 -mx-4 border-b border-border bg-background px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
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
							onClick={() => save()}
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
									onClick={unpublish}
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
								onClick={publish}
							>
								{isPublishing ? "Publishing..." : "Publish"}
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<form onSubmit={save} className="space-y-6">
					<section className="space-y-4">
						<h2 className="font-semibold">Basics</h2>
						<div className="space-y-2">
							<Label htmlFor="tagline">Tagline</Label>
							<Input
								id="tagline"
								value={form.tagline}
								onChange={(event) => updateField("tagline", event.target.value)}
								placeholder="One-line pitch"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={form.description}
								onChange={(event) =>
									updateField("description", event.target.value)
								}
								placeholder="What are you building?"
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="website">Website</Label>
							<Input
								id="website"
								type="url"
								value={form.website}
								onChange={(event) => updateField("website", event.target.value)}
								placeholder="https://"
							/>
						</div>
					</section>

					<section className="space-y-4">
						<h2 className="font-semibold">Pitch sections</h2>
						<div className="flex flex-wrap gap-2">
							{pitchSections.map(({ key, label }) => (
								<Button
									key={key}
									type="button"
									size="sm"
									variant={activeSection === key ? "secondary" : "outline"}
									className={cn(
										!sectionValues[key].trim() &&
											activeSection !== key &&
											"border-dashed text-muted-foreground",
									)}
									onClick={() => setActiveSection(key)}
								>
									{label}
								</Button>
							))}
						</div>
						{pitchSections.map(({ key, label, placeholder }) =>
							activeSection === key ? (
								<div key={key} className="space-y-2">
									<Label htmlFor={key}>{label}</Label>
									<Textarea
										id={key}
										value={sectionValues[key]}
										onChange={(event) => updateField(key, event.target.value)}
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
						tagline={form.tagline}
						description={form.description}
						sections={sectionValues}
					/>
					<p className="mt-3 text-center text-xs text-muted-foreground">
						Public page:{" "}
						<span className="font-mono">/s/{startup.slug}</span>
					</p>
				</div>
			</div>
		</div>
	);
}
