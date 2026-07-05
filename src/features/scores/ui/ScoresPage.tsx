import { Link } from "@tanstack/react-router";
import { PageLoading } from "~/components/shared/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { useScores } from "~/features/scores/hooks/useScores";

export function ScoresPage() {
	const { score, leaderboard, isClaiming, claim } = useScores();

	if (score === undefined) {
		return <PageLoading />;
	}

	const progressToNext = score.totalScore % 500;

	return (
		<div className="w-full space-y-8 py-8">
			<div>
				<h1 className="text-2xl font-bold">Scores</h1>
				<p className="text-sm text-muted-foreground">
					Claim daily points and climb the leaderboard
				</p>
			</div>

			<Card className="shadow-none">
				<CardContent className="space-y-5 p-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Your score</p>
							<p className="text-4xl font-semibold tabular-nums tracking-tight">
								{score.totalScore}
							</p>
						</div>
						<Badge variant="secondary">{score.planTier}</Badge>
					</div>
					<div className="space-y-2">
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Milestone progress</span>
							<span>{progressToNext}/500</span>
						</div>
						<Progress value={(progressToNext / 500) * 100} />
					</div>
					<Button
						className="w-full sm:w-auto"
						disabled={!score.canClaimToday || isClaiming}
						onClick={claim}
					>
						{isClaiming
							? "Claiming..."
							: score.canClaimToday
								? `Claim ${score.dailyAmount} points`
								: "Claimed today"}
					</Button>
				</CardContent>
			</Card>

			<section className="space-y-4">
				<h2 className="text-lg font-semibold">Leaderboard</h2>
				{leaderboard === undefined ? (
					<PageLoading rows={5} />
				) : leaderboard.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No scores yet. Be the first to claim.
					</p>
				) : (
					<ul className="space-y-2">
						{leaderboard.map((entry, index) => (
							<li key={entry._id}>
								<Card className="gap-0 py-0 shadow-none">
									<CardContent className="flex items-center justify-between p-4">
										<div className="flex items-center gap-3">
											<span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums">
												{index + 1}
											</span>
											<span className="font-medium">
												{entry.name ?? "Anonymous"}
											</span>
										</div>
										<span className="font-medium tabular-nums">
											{entry.totalScore}
										</span>
									</CardContent>
								</Card>
							</li>
						))}
					</ul>
				)}
			</section>

			<p className="text-sm text-muted-foreground">
				Earn more by completing tasks and joining hiring sprints.{" "}
				<Link to="/app/explore" className="underline hover:text-foreground">
					Explore sprints
				</Link>
			</p>
		</div>
	);
}
