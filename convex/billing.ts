import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
	internalMutation,
	internalQuery,
	query,
} from "./_generated/server";
import { isProUser, requireUserId } from "./lib/auth";

export const getSubscription = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.order("desc")
			.first();

		const pro = await isProUser(ctx, userId);

		return {
			isPro: pro,
			planTier: pro ? "pro" : ("free" as const),
			subscription,
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
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("subscriptions")
			.withIndex("by_providerSubscriptionId", (q) =>
				q.eq("providerSubscriptionId", args.providerSubscriptionId),
			)
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				status: args.status,
				currentPeriodEnd: args.currentPeriodEnd,
			});
		} else {
			await ctx.db.insert("subscriptions", {
				userId: args.userId,
				provider: "dodo",
				providerSubscriptionId: args.providerSubscriptionId,
				status: args.status,
				plan: "pro",
				currentPeriodEnd: args.currentPeriodEnd,
			});
		}

		if (args.status === "active" || args.status === "trialing") {
			await ctx.db.patch(args.userId, { planTier: "pro" });
		} else if (args.status === "cancelled" || args.status === "past_due") {
			await ctx.db.patch(args.userId, { planTier: "free" });
		}
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

export const getUserById = internalQuery({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	},
});
