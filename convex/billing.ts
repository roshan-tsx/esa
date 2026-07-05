import { v } from "convex/values";
import {
	internalMutation,
	internalQuery,
	query,
} from "./_generated/server";
import { isProUser, requireUserId } from "./lib/auth";

// Dummy billing backend — replace with Dodo Payments integration later.
// Real implementation preserved in git history.

export const getSubscription = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		const pro = await isProUser(ctx, userId);

		return {
			isPro: pro,
			planTier: pro ? ("pro" as const) : ("free" as const),
			subscription: null,
		};
	},
});

export const activatePro = internalMutation({
	args: {
		userId: v.id("users"),
		providerSubscriptionId: v.string(),
		status: v.union(
			v.literal("active"),
			v.literal("cancelled"),
			v.literal("past_due"),
			v.literal("trialing"),
		),
		currentPeriodEnd: v.optional(v.number()),
	},
	handler: async () => {
		// No-op until Dodo Payments is wired up.
	},
});

export const getUserByEmail = internalQuery({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("email", (q) => q.eq("email", args.email))
			.unique();
	},
});
