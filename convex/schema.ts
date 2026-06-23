import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,
	users: defineTable({
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		email: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		phone: v.optional(v.string()),
		phoneVerificationTime: v.optional(v.number()),
		isAnonymous: v.optional(v.boolean()),
		planTier: v.optional(v.union(v.literal("free"), v.literal("pro"))),
	})
		.index("email", ["email"])
		.index("phone", ["phone"]),
	subscriptions: defineTable({
		userId: v.id("users"),
		provider: v.literal("dodo"),
		providerSubscriptionId: v.string(),
		status: v.union(
			v.literal("active"),
			v.literal("cancelled"),
			v.literal("past_due"),
			v.literal("trialing"),
		),
		plan: v.literal("pro"),
		currentPeriodEnd: v.optional(v.number()),
	})
		.index("by_userId", ["userId"])
		.index("by_providerSubscriptionId", ["providerSubscriptionId"]),
	startups: defineTable({
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		tagline: v.optional(v.string()),
		website: v.optional(v.string()),
		founderUserId: v.id("users"),
	})
		.index("by_slug", ["slug"])
		.index("by_founderUserId", ["founderUserId"]),
	memberships: defineTable({
		startupId: v.id("startups"),
		userId: v.id("users"),
		role: v.union(v.literal("founder"), v.literal("member")),
	})
		.index("by_startupId_and_userId", ["startupId", "userId"])
		.index("by_userId", ["userId"])
		.index("by_startupId", ["startupId"]),
	invites: defineTable({
		startupId: v.id("startups"),
		email: v.string(),
		role: v.union(v.literal("founder"), v.literal("member")),
		token: v.string(),
		invitedByUserId: v.id("users"),
		status: v.union(
			v.literal("pending"),
			v.literal("accepted"),
			v.literal("expired"),
		),
		expiresAt: v.number(),
	})
		.index("by_token", ["token"])
		.index("by_startupId_and_email", ["startupId", "email"])
		.index("by_startupId", ["startupId"]),
});
