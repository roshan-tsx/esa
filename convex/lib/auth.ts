import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export async function requireUserId(ctx: AuthCtx): Promise<Id<"users">> {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new Error("Not authenticated");
	}
	return userId;
}

export async function initUserProfile(
	ctx: MutationCtx,
	userId: Id<"users">,
): Promise<void> {
	const user = await ctx.db.get(userId);
	if (user && !user.planTier) {
		await ctx.db.patch(userId, { planTier: "free" });
	}
}

export async function isProUser(
	ctx: AuthCtx,
	userId: Id<"users">,
): Promise<boolean> {
	const user = await ctx.db.get(userId);
	return user?.planTier === "pro";
}
