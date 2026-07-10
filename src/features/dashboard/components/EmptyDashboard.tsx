import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export function EmptyDashboard() {
	return (
		<div className="mx-auto flex w-full max-w-xl flex-col items-center py-16 text-center">
			<h1 className="text-2xl font-bold sm:text-3xl">Create a startup</h1>
			<p className="mt-3 text-muted-foreground">
				Add a workspace to manage tasks, pitch deck, team invites, and hiring
				sprints. Switch between startups anytime from the top bar.
			</p>
			<ol className="mt-8 w-full space-y-2 text-left text-sm text-muted-foreground"></ol>
			<Button asChild size="lg" className="mt-8">
				<Link to="/app/startups/new">Create startup</Link>
			</Button>
		</div>
	);
}
