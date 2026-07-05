import { useConvexAuth } from "@convex-dev/auth/react";
import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

export function useUpgrade() {
	const { isAuthenticated } = useConvexAuth();
	const subscription = useQuery(
		api.billing.getSubscription,
		isAuthenticated ? {} : "skip",
	);
	const createCheckout = useAction(api.billingActions.createCheckoutLink);
	const [isLoading, setIsLoading] = useState(false);

	async function upgrade() {
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

	return {
		isAuthenticated,
		subscription,
		isLoading,
		upgrade,
	};
}
