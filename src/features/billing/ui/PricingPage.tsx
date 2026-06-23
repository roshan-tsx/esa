import { useConvexAuth } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "@convex/_generated/api";

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
			const message =
				error instanceof Error ? error.message : "Checkout failed";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 p-10">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Engin Pro</h1>
				<p className="text-muted-foreground">
					Unlimited sprint applications and priority access.
				</p>
			</div>

			<div className="rounded-xl border p-6 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Pro plan</h2>
					{subscription?.isPro && <Badge>Active</Badge>}
				</div>
				<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
					<li>Unlimited hiring sprint applications</li>
					<li>Priority founder tools</li>
					<li>Team collaboration features</li>
				</ul>

				{subscription?.isPro ? (
					<Button asChild variant="outline">
						<Link to="/app/dashboard">Back to dashboard</Link>
					</Button>
				) : isAuthenticated ? (
					<Button onClick={handleUpgrade} disabled={isLoading}>
						{isLoading ? "Redirecting..." : "Upgrade to Pro"}
					</Button>
				) : (
					<Button asChild>
						<Link to="/">Sign in to upgrade</Link>
					</Button>
				)}
			</div>
		</div>
	);
}
