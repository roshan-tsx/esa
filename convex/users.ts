import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId, initUserProfile } from "./lib/auth";

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
