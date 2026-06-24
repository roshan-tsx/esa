import { useConvexAuth } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { api } from "@convex/_generated/api";

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
	const { isAuthenticated } = useConvexAuth();
	const subscription = useQuery(
		api.billing.getSubscription,
		isAuthenticated ? {} : "skip",
	);
	const createCheckout = useAction(api.billingActions.createCheckoutLink);
	const [isLoading, setIsLoading] = useState(false);

	async function handleUpgrade() {
		if (!isAuthenticated) {
			toast.error("Sign in to upgrade");
			return;
		}

		setIsLoading(true);
		try {
			const result = await createCheckout({
				returnUrl: `${window.location.origin}/app/dashboard`,
			});
			window.location.href = result.checkoutUrl;
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Checkout failed");
		} finally {
			setIsLoading(false);
		}
	}

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

			<main className="w-full px-4 py-10 sm:px-6 lg:px-8 space-y-10">
				<div>
					<h1 className="text-3xl font-bold sm:text-4xl">Pricing</h1>
					<p className="mt-2 max-w-2xl text-muted-foreground">
						Start free. Upgrade to Pro when you are ready to hire at scale.
						Plans and discounts are handled at checkout.
					</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<Card className="shadow-none">
						<CardHeader>
							<CardTitle>Free</CardTitle>
							<p className="text-3xl font-bold">$0</p>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								{freeFeatures.map((f) => (
									<li key={f}>{f}</li>
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
								{proFeatures.map((f) => (
									<li key={f}>{f}</li>
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
									onClick={handleUpgrade}
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
