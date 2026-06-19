import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/app/dashboard/startup/new/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 items-center justify-center p-6">
			<div className="w-full max-w-xl rounded-2xl border bg-card/40 p-6 text-center">
				<p className="text-2xl font-semibold">Create Startup</p>
				<p className="mt-2 text-sm text-muted-foreground">
					This flow is being rebuilt under the new feature architecture.
				</p>
				<div className="mt-6 flex items-center justify-center gap-3">
					<Button asChild>
						<Link to="/app/dashboard/startup/new/verifypan">Continue</Link>
					</Button>
					<Button asChild variant="outline">
						<Link to="/app/dashboard">Back to dashboard</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
