import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

type CreateStartupPromptProps = {
	readonly title: string;
	readonly description: string;
	readonly actionLabel?: string;
};

export function CreateStartupPrompt({
	title,
	description,
	actionLabel = "Create startup",
}: CreateStartupPromptProps) {
	return (
		<div className="mx-auto flex w-full max-w-xl flex-col items-center py-16 text-center">
			<h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
			<p className="mt-3 text-muted-foreground">{description}</p>
			<Button asChild size="lg" className="mt-8">
				<Link to="/app/startups/new">{actionLabel}</Link>
			</Button>
		</div>
	);
}
