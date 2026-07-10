import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { initUserProfile, requireUserId } from "./lib/auth";

export const getMe = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		const user = await ctx.db.get(userId);
		if (!user) {
			return null;
		}

		return {
			_id: user._id,
			name: user.name ?? null,
			email: user.email ?? null,
			image: user.image ?? null,
			planTier: user.planTier ?? "free",
			totalScore: user.totalScore ?? 0,
		};
	},
});

export const getById = internalQuery({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	},
});

export const getByEmail = internalQuery({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("email", (q) => q.eq("email", args.email))
			.unique();
	},
});

export const ensureProfile = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		await initUserProfile(ctx, userId);
		return userId;
	},
});

export const updateProfile = mutation({
	args: {
		name: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await ctx.db.patch(userId, { name: args.name });
		return userId;
	},
});
