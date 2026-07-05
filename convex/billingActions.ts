"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action } from "./_generated/server";

// Dummy billing backend — replace with Dodo Payments integration later.
// Real implementation preserved in git history.

export const createCheckoutLink = action({
	args: {
		returnUrl: v.string(),
	},
	handler: async (ctx): Promise<{ checkoutUrl: string }> => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}

		throw new Error("Billing is not configured yet");
	},
});
