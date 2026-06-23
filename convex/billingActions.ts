"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action } from "./_generated/server";

export const createCheckoutLink = action({
	args: {
		returnUrl: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}
		const apiKey = process.env.DODO_PAYMENTS_API_KEY;
		const productId = process.env.DODO_PRO_PLAN_ID;
		const environment = process.env.DODO_ENVIRONMENT ?? "test_mode";

		if (!apiKey || !productId) {
			throw new Error("Dodo Payments is not configured");
		}

		const baseUrl =
			environment === "live_mode"
				? "https://live.dodopayments.com"
				: "https://test.dodopayments.com";

		const response = await fetch(`${baseUrl}/checkouts`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				product_cart: [{ product_id: productId, quantity: 1 }],
				return_url: args.returnUrl,
				metadata: { userId },
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Failed to create checkout: ${errorText}`);
		}

		const data = (await response.json()) as {
			checkout_url?: string;
			url?: string;
		};

		const checkoutUrl = data.checkout_url ?? data.url;
		if (!checkoutUrl) {
			throw new Error("Checkout URL missing from Dodo response");
		}

		return { checkoutUrl };
	},
});
