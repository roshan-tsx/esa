import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { initUserProfile, requireUserId } from "./lib/auth";
import { DAILY_SCORE_AMOUNT, utcDateString } from "./lib/time";

export const getMyScore = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		const user = await ctx.db.get(userId);
		const today = utcDateString();

		const todayClaim = await ctx.db
			.query("dailyScoreClaims")
			.withIndex("by_userId_and_claimDate", (q) =>
				q.eq("userId", userId).eq("claimDate", today),
			)
			.unique();

		return {
			totalScore: user?.totalScore ?? 0,
			canClaimToday: !todayClaim,
			dailyAmount: DAILY_SCORE_AMOUNT,
			planTier: user?.planTier ?? "free",
		};
	},
});

export const claimDaily = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		await initUserProfile(ctx, userId);

		const today = utcDateString();
		const existing = await ctx.db
			.query("dailyScoreClaims")
			.withIndex("by_userId_and_claimDate", (q) =>
				q.eq("userId", userId).eq("claimDate", today),
			)
			.unique();

		if (existing) {
			throw new Error("You already claimed today's score");
		}

		const user = await ctx.db.get(userId);
		if (!user) {
			throw new Error("User not found");
		}

		await ctx.db.insert("dailyScoreClaims", {
			userId,
			claimDate: today,
			amount: DAILY_SCORE_AMOUNT,
		});

		const newTotal = (user.totalScore ?? 0) + DAILY_SCORE_AMOUNT;
		await ctx.db.patch(userId, { totalScore: newTotal });

		return { totalScore: newTotal, claimed: DAILY_SCORE_AMOUNT };
	},
});

export const getLeaderboard = query({
	args: {},
	handler: async (ctx) => {
		await requireUserId(ctx);

		const users = await ctx.db.query("users").take(100);
		const ranked = users
			.filter((u) => (u.totalScore ?? 0) > 0)
			.sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))
			.slice(0, 20)
			.map((u) => ({
				_id: u._id,
				name: u.name ?? null,
				totalScore: u.totalScore ?? 0,
			}));

		return ranked;
	},
});
