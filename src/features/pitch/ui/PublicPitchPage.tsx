import { useConvexAuth } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { PageLoading } from "~/components/globals/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { api } from "@convex/_generated/api";

type PublicPitchPageProps = {
	readonly slug: string;
};

function PitchSection({
	title,
	content,
}: {
	readonly title: string;
	readonly content: string | null;
}) {
	if (!content) return null;
	return (
		<section className="space-y-2">
			<h2 className="text-lg font-semibold">{title}</h2>
			<p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
				{content}
			</p>
		</section>
	);
}

function PublicHeader() {
	return (
		<header className="flex h-16 items-center justify-between border-b-2 border-border px-4 sm:px-6">
			<Link to="/" className="text-xl font-bold">
				Engin
			</Link>
			<Button asChild size="sm">
				<Link to="/">Join Engin</Link>
			</Button>
		</header>
	);
}

export function PublicPitchPage({ slug }: PublicPitchPageProps) {
	const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
	const pitch = useQuery(api.startups.getPublicPitch, { slug });

	if (pitch === undefined || authLoading) {
		return (
			<div className="min-h-dvh bg-background">
				<PublicHeader />
				<PageLoading />
			</div>
		);
	}

	if (!pitch) {
		return (
			<div className="min-h-dvh bg-background">
				<PublicHeader />
				<div className="mx-auto max-w-lg px-4 py-20 text-center">
					<h1 className="text-2xl font-bold">Pitch not found</h1>
					<Button asChild variant="outline" className="mt-6">
						<Link to="/">Back home</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-dvh bg-background">
			<PublicHeader />
			<main className="mx-auto max-w-2xl px-4 py-10 space-y-10">
				<div className="space-y-4">
					<Badge variant="secondary">Startup</Badge>
					<h1 className="text-3xl font-bold sm:text-4xl">{pitch.name}</h1>
					{pitch.tagline && (
						<p className="text-lg text-muted-foreground">{pitch.tagline}</p>
					)}
					{pitch.website && (
						<a
							href={pitch.website}
							target="_blank"
							rel="noreferrer"
							className="text-sm underline hover:text-foreground"
						>
							{pitch.website}
						</a>
					)}
				</div>

				{pitch.canViewFull && pitch.full ? (
					<div className="space-y-8">
						<PitchSection title="About" content={pitch.full.description} />
						<PitchSection title="Problem" content={pitch.full.pitchProblem} />
						<PitchSection title="Solution" content={pitch.full.pitchSolution} />
						<PitchSection title="Market" content={pitch.full.pitchMarket} />
						<PitchSection title="Traction" content={pitch.full.pitchTraction} />
						<PitchSection title="Team" content={pitch.full.pitchTeam} />
					</div>
				) : (
					<Card className="border-dashed shadow-none">
						<CardContent className="space-y-4 p-8 text-center">
							<h2 className="text-lg font-semibold">
								Join Engin to view the full pitch
							</h2>
							{!isAuthenticated && (
								<Button asChild>
									<Link to="/">Join Engin to view more</Link>
								</Button>
							)}
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	);
}
