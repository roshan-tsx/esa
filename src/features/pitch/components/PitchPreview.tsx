import {
	pitchSections,
	type PitchSectionKey,
} from "~/features/pitch/types/pitch";

type PitchPreviewProps = {
	readonly name: string;
	readonly tagline: string;
	readonly description: string;
	readonly sections: Record<PitchSectionKey, string>;
};

export function PitchPreview({
	name,
	tagline,
	description,
	sections,
}: PitchPreviewProps) {
	return (
		<div className="space-y-5 rounded-lg border bg-card p-5 text-sm">
			<div className="space-y-2 border-b border-border pb-4">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Preview
				</p>
				<h2 className="text-xl font-bold">{name || "Your startup"}</h2>
				{tagline && <p className="font-medium">{tagline}</p>}
				{description && (
					<p className="whitespace-pre-wrap text-muted-foreground">{description}</p>
				)}
			</div>
			{pitchSections.map(({ key, label }) => {
				const content = sections[key];
				if (!content) return null;
				return (
					<div key={key}>
						<h3 className="font-semibold">{label}</h3>
						<p className="mt-1 whitespace-pre-wrap text-muted-foreground">
							{content}
						</p>
					</div>
				);
			})}
			{!tagline &&
				!description &&
				pitchSections.every((section) => !sections[section.key]) && (
					<p className="py-6 text-center text-muted-foreground">
						Start typing to see your pitch preview.
					</p>
				)}
		</div>
	);
}
