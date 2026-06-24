import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type MembershipCtx = QueryCtx | MutationCtx;

export async function requireMembership(
	ctx: MembershipCtx,
	startupId: Id<"startups">,
	userId: Id<"users">,
) {
	const membership = await ctx.db
		.query("memberships")
		.withIndex("by_startupId_and_userId", (q) =>
			q.eq("startupId", startupId).eq("userId", userId),
		)
		.unique();

	if (!membership) {
		throw new Error("Unauthorized");
	}

	return membership;
}

export async function requireFounderMembership(
	ctx: MembershipCtx,
	startupId: Id<"startups">,
	userId: Id<"users">,
) {
	const membership = await requireMembership(ctx, startupId, userId);
	if (membership.role !== "founder") {
		throw new Error("Only founders can perform this action");
	}
	return membership;
}
