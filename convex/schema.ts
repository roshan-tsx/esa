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
		totalScore: v.optional(v.number()),
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
		isPublic: v.optional(v.boolean()),
		pitchProblem: v.optional(v.string()),
		pitchSolution: v.optional(v.string()),
		pitchMarket: v.optional(v.string()),
		pitchTraction: v.optional(v.string()),
		pitchTeam: v.optional(v.string()),
		publishedAt: v.optional(v.number()),
	})
		.index("by_slug", ["slug"])
		.index("by_founderUserId", ["founderUserId"])
		.index("by_isPublic", ["isPublic"]),
	tasks: defineTable({
		startupId: v.id("startups"),
		title: v.string(),
		description: v.optional(v.string()),
		status: v.union(
			v.literal("todo"),
			v.literal("in_progress"),
			v.literal("done"),
		),
		assigneeUserId: v.optional(v.id("users")),
		createdByUserId: v.id("users"),
		order: v.number(),
	})
		.index("by_startupId", ["startupId"])
		.index("by_startupId_and_status", ["startupId", "status"]),
	memberships: defineTable({
		startupId: v.id("startups"),
		userId: v.id("users"),
		role: v.union(v.literal("founder"), v.literal("member")),
	})
		.index("by_startupId_and_userId", ["startupId", "userId"])
		.index("by_userId", ["userId"])
		.index("by_startupId", ["startupId"]),
	hiringSprints: defineTable({
		startupId: v.id("startups"),
		founderUserId: v.id("users"),
		title: v.string(),
		description: v.string(),
		role: v.string(),
		taskTitles: v.array(v.string()),
		rankingCriteria: v.optional(v.string()),
		perks: v.optional(v.string()),
		maxCandidates: v.number(),
		status: v.union(
			v.literal("open"),
			v.literal("active"),
			v.literal("completed"),
			v.literal("expired"),
		),
		postedAt: v.number(),
		expiresAt: v.number(),
		directJoinEndsAt: v.number(),
		startedAt: v.optional(v.number()),
		hiredUserId: v.optional(v.id("users")),
	})
		.index("by_startupId", ["startupId"])
		.index("by_status", ["status"])
		.index("by_founderUserId", ["founderUserId"]),
	sprintApplications: defineTable({
		sprintId: v.id("hiringSprints"),
		userId: v.id("users"),
		status: v.union(
			v.literal("joined"),
			v.literal("applied"),
			v.literal("accepted"),
			v.literal("rejected"),
			v.literal("withdrawn"),
			v.literal("closed"),
		),
		type: v.union(v.literal("direct"), v.literal("apply")),
		appliedAt: v.number(),
		applicationDate: v.string(),
		closedReason: v.optional(v.string()),
	})
		.index("by_sprintId", ["sprintId"])
		.index("by_userId", ["userId"])
		.index("by_userId_and_applicationDate", ["userId", "applicationDate"])
		.index("by_sprintId_and_userId", ["sprintId", "userId"]),
	sprintMessages: defineTable({
		sprintId: v.id("hiringSprints"),
		userId: v.id("users"),
		content: v.string(),
		createdAt: v.number(),
	})
		.index("by_sprintId", ["sprintId"]),
	dailyScoreClaims: defineTable({
		userId: v.id("users"),
		claimDate: v.string(),
		amount: v.number(),
	})
		.index("by_userId_and_claimDate", ["userId", "claimDate"])
		.index("by_userId", ["userId"]),
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
