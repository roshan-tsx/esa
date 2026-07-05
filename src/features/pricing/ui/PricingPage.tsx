import { Link } from "@tanstack/react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { useUpgrade } from "~/features/pricing/hooks/useUpgrade";

const freeFeatures = [
	"Team tasks & founder dashboard",
	"Public pitch deck page",
	"Team invites & collaboration",
	"Explore startups & sprints",
	"3 sprint applications per day",
	"Daily 100 score claims",
];

const proFeatures = [
	"Unlimited sprint applications",
	"Sprint chat & direct hire",
	"Post & run hiring sprints",
	"Priority founder tools",
	"Pro badge on Explore",
];

export function PricingPage() {
	const { isAuthenticated, subscription, isLoading, upgrade } = useUpgrade();

	return (
		<div className="min-h-dvh bg-background">
			<header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8">
				<Link to="/" className="text-xl font-semibold sm:text-2xl">
					Engin
				</Link>
				<Button asChild variant="outline" size="sm">
					<Link to={isAuthenticated ? "/app/dashboard" : "/"}>
						{isAuthenticated ? "Dashboard" : "Sign in"}
					</Link>
				</Button>
			</header>

			<main className="w-full space-y-10 px-4 py-10 sm:px-6 lg:px-8">
				<div>
					<h1 className="text-3xl font-bold sm:text-4xl">Pricing</h1>
					<p className="mt-2 max-w-2xl text-muted-foreground">
						Start free. Upgrade to Pro when you are ready to hire at scale.
						Plans and discounts are handled at checkout.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<Card className="shadow-none">
						<CardHeader>
							<CardTitle>Free</CardTitle>
							<p className="text-3xl font-bold">$0</p>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								{freeFeatures.map((feature) => (
									<li key={feature}>{feature}</li>
								))}
							</ul>
						</CardContent>
						<CardFooter>
							<Button asChild variant="outline" className="w-full">
								<Link to="/">Get started</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card className="shadow-none">
						<CardHeader>
							<div className="flex items-center justify-between gap-2">
								<CardTitle>Pro</CardTitle>
								{subscription?.isPro && <Badge>Active</Badge>}
							</div>
							<p className="text-sm text-muted-foreground">
								Yearly plan · pricing shown at checkout
							</p>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								{proFeatures.map((feature) => (
									<li key={feature}>{feature}</li>
								))}
							</ul>
						</CardContent>
						<CardFooter>
							{subscription?.isPro ? (
								<Button asChild className="w-full">
									<Link to="/app/dashboard">Go to dashboard</Link>
								</Button>
							) : isAuthenticated ? (
								<Button
									className="w-full"
									onClick={upgrade}
									disabled={isLoading}
								>
									{isLoading ? "Redirecting..." : "Upgrade to Pro"}
								</Button>
							) : (
								<Button asChild className="w-full">
									<Link to="/">Sign in to upgrade</Link>
								</Button>
							)}
						</CardFooter>
					</Card>
				</div>
			</main>
		</div>
	);
}
