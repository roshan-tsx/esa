import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageLoading } from "~/components/shared/PageLoading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

type ExplorePageProps = {
	readonly inApp?: boolean;
};

type Tab = "all" | "startups" | "sprints";

function formatTimeLeft(expiresAt: number) {
	const diff = expiresAt - Date.now();
	if (diff <= 0) return "Expired";
	const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
	return `${days}d left`;
}

export function ExplorePage({ inApp = false }: ExplorePageProps) {
	const [search, setSearch] = useState("");
	const [role, setRole] = useState("");
	const [tab, setTab] = useState<Tab>("all");
	const [pendingSprint, setPendingSprint] = useState<Id<"hiringSprints"> | null>(
		null,
	);

	const results = useQuery(api.explore.search, {
		search: search || undefined,
		role: role || undefined,
		tab,
	});

	const directJoin = useMutation(api.sprints.directJoin);
	const apply = useMutation(api.sprints.apply);

	async function handleJoin(sprintId: Id<"hiringSprints">, phase: string) {
		if (!results?.isAuthenticated) {
			toast.error("Sign in to join sprints");
			return;
		}

		setPendingSprint(sprintId);
		try {
			if (phase === "direct_join") {
				await directJoin({ sprintId });
				toast.success("Joined sprint!");
			} else {
				await apply({ sprintId });
				toast.success("Application submitted");
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Action failed";
			toast.error(message);
		} finally {
			setPendingSprint(null);
		}
	}

	const tabs: { value: Tab; label: string }[] = [
		{ value: "all", label: "All" },
		{ value: "startups", label: "Startups" },
		{ value: "sprints", label: "Sprints" },
	];

	const content = (
		<div className="w-full py-8 space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Explore</h1>
					<p className="text-sm text-muted-foreground">
						Discover startups and hiring sprints
					</p>
				</div>
				{!inApp && (
					<Button asChild>
						<Link to="/">Sign in</Link>
					</Button>
				)}
			</div>

				<div className="flex flex-col gap-3 sm:flex-row">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search name, role, description..."
							className="h-11 pl-9"
						/>
					</div>
					<Input
						value={role}
						onChange={(e) => setRole(e.target.value)}
						placeholder="Filter by role"
						className="h-11 sm:max-w-[200px]"
					/>
				</div>

				<div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:display-none">
					{tabs.map(({ value, label }) => (
						<Button
							key={value}
							type="button"
							size="sm"
							variant={tab === value ? "default" : "outline"}
							className="shrink-0"
							onClick={() => setTab(value)}
						>
							{label}
						</Button>
					))}
				</div>

				{results && !results.isPro && results.applicationLimit !== null && (
					<p className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
						Free plan: {results.applicationLimit} sprint applications per day.{" "}
						<Link to="/pricing" className="underline hover:text-foreground">
							Go Pro
						</Link>{" "}
						for unlimited.
					</p>
				)}

				{results === undefined ? (
					<PageLoading />
				) : (
					<div className="space-y-10">
						{tab !== "sprints" && results.startups.length > 0 && (
							<section className="space-y-4">
								<h2 className="text-lg font-semibold">Startups</h2>
								<div className="grid gap-3 sm:grid-cols-2">
									{results.startups.map((startup) => (
										<Link
											key={startup._id}
											to="/s/$slug"
											params={{ slug: startup.slug }}
										>
											<Card className="h-full gap-2 py-4 shadow-none transition-colors hover:bg-muted/30">
												<CardContent className="px-4">
													<h3 className="font-semibold">{startup.name}</h3>
													{startup.tagline && (
														<p className="mt-1 text-sm text-muted-foreground line-clamp-2">
															{startup.tagline}
														</p>
													)}
												</CardContent>
											</Card>
										</Link>
									))}
								</div>
							</section>
						)}

						{tab !== "startups" && (
							<section className="space-y-4">
								<h2 className="text-lg font-semibold">Hiring sprints</h2>
								{results.sprints.length === 0 ? (
									<p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
										No sprints found.
									</p>
								) : (
									<div className="grid gap-3">
										{results.sprints.map((sprint) => (
											<Card
												key={sprint._id}
												className="gap-4 border-border/60 py-4 shadow-none"
											>
												<CardContent className="space-y-4 px-4">
													<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
														<div className="min-w-0">
															<h3 className="font-semibold">{sprint.title}</h3>
															<p className="text-sm text-muted-foreground">
																{sprint.startupName} · {sprint.role}
															</p>
														</div>
														<div className="flex flex-wrap gap-1.5">
															<Badge variant="outline">
																{sprint.joinedCount}/{sprint.maxCandidates}
															</Badge>
															<Badge variant="secondary">
																{formatTimeLeft(sprint.expiresAt)}
															</Badge>
															<Badge>
																{sprint.phase === "direct_join"
																	? "Direct join"
																	: "Apply"}
															</Badge>
														</div>
													</div>
													<p className="text-sm text-muted-foreground line-clamp-2">
														{sprint.description}
													</p>
													{sprint.taskTitles.length > 0 && (
														<div className="flex flex-wrap gap-1.5">
															{sprint.taskTitles.map((task) => (
																<Badge key={task} variant="secondary">
																	{task}
																</Badge>
															))}
														</div>
													)}
													<div className="flex flex-wrap gap-2">
														{inApp ? (
															<>
																<Button asChild size="sm" variant="outline">
																	<Link
																		to="/app/sprints/$sprintId"
																		params={{ sprintId: sprint._id }}
																	>
																		Details
																	</Link>
																</Button>
																{!sprint.isFull && (
																	<Button
																		size="sm"
																		disabled={pendingSprint === sprint._id}
																		onClick={() =>
																			handleJoin(sprint._id, sprint.phase)
																		}
																	>
																		{pendingSprint === sprint._id
																			? "..."
																			: sprint.phase === "direct_join"
																				? "Join"
																				: "Apply"}
																	</Button>
																)}
															</>
														) : (
															<Button asChild size="sm">
																<Link to="/">Sign in to join</Link>
															</Button>
														)}
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</section>
						)}

						{results.startups.length === 0 && results.sprints.length === 0 && (
							<p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
								Nothing found. Try different filters.
							</p>
						)}
					</div>
				)}
		</div>
	);

	if (inApp) return content;

	return (
		<div className="min-h-dvh bg-background">
			<header className="flex h-16 items-center justify-between border-b-2 border-border px-4 sm:px-6">
				<Link to="/" className="text-xl font-bold">
					Engin
				</Link>
				<div className="flex gap-2">
					<Button asChild variant="ghost" size="sm">
						<Link to="/pricing">Pricing</Link>
					</Button>
					<Button asChild size="sm">
						<Link to="/">Sign in</Link>
					</Button>
				</div>
			</header>
			{content}
		</div>
	);
}
