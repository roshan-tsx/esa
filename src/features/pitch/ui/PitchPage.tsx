import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { PitchEditor } from "~/features/pitch/components/PitchEditor";
import { useWorkspace } from "~/features/app/hooks/useWorkspace";
import { PageLoading } from "~/components/globals/PageLoading";

export function PitchPage() {
	const { active: startup, isLoading } = useWorkspace();

	if (isLoading) {
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
			<div className="mx-auto w-full max-w-xl space-y-4 py-16 text-center">
				<h1 className="text-2xl font-bold">Pitch deck</h1>
				<p className="text-muted-foreground">
					Only founders can edit the pitch.
				</p>
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
