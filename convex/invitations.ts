import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
	type MutationCtx,
	type QueryCtx,
	mutation,
	query,
} from "./_generated/server";
import { requireUserId } from "./lib/auth";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function generateToken(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function requireFounderMembership(
	ctx: QueryCtx | MutationCtx,
	startupId: Id<"startups">,
	userId: Id<"users">,
) {
	const membership = await ctx.db
		.query("memberships")
		.withIndex("by_startupId_and_userId", (q) =>
			q.eq("startupId", startupId).eq("userId", userId),
		)
		.unique();

	if (!membership || membership.role !== "founder") {
		throw new Error("Only founders can manage team invites");
	}

	return membership;
}

export const listMembers = query({
	args: { startupId: v.id("startups") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const viewerMembership = await ctx.db
			.query("memberships")
			.withIndex("by_startupId_and_userId", (q) =>
				q.eq("startupId", args.startupId).eq("userId", userId),
			)
			.unique();

		if (!viewerMembership) {
			throw new Error("Unauthorized");
		}

		const memberships = await ctx.db
			.query("memberships")
			.withIndex("by_startupId", (q) => q.eq("startupId", args.startupId))
			.take(50);

		const members = [];
		for (const membership of memberships) {
			const user = await ctx.db.get(membership.userId);
			if (user) {
				members.push({
					_id: membership._id,
					role: membership.role,
					user: {
						_id: user._id,
						name: user.name ?? null,
						email: user.email ?? null,
						image: user.image ?? null,
					},
				});
			}
		}

		return members;
	},
});

export const listInvites = query({
	args: { startupId: v.id("startups") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireFounderMembership(ctx, args.startupId, userId);

		return await ctx.db
			.query("invites")
			.withIndex("by_startupId", (q) => q.eq("startupId", args.startupId))
			.take(50);
	},
});

export const createInvite = mutation({
	args: {
		startupId: v.id("startups"),
		email: v.string(),
		role: v.union(v.literal("founder"), v.literal("member")),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireFounderMembership(ctx, args.startupId, userId);

		const email = args.email.trim().toLowerCase();
		if (!email.includes("@")) {
			throw new Error("Invalid email");
		}

		const existingInvite = await ctx.db
			.query("invites")
			.withIndex("by_startupId_and_email", (q) =>
				q.eq("startupId", args.startupId).eq("email", email),
			)
			.first();

		if (existingInvite?.status === "pending") {
			return { inviteId: existingInvite._id };
		}

		const inviteId = await ctx.db.insert("invites", {
			startupId: args.startupId,
			email,
			role: args.role,
			token: generateToken(),
			invitedByUserId: userId,
			status: "pending",
			expiresAt: Date.now() + INVITE_TTL_MS,
		});

		return { inviteId };
	},
});

export const listMyPendingInvites = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		const user = await ctx.db.get(userId);
		if (!user?.email) {
			return [];
		}

		const email = user.email.toLowerCase();
		const now = Date.now();

		const invites = await ctx.db
			.query("invites")
			.withIndex("by_email", (q) => q.eq("email", email))
			.take(50);

		const pending = invites.filter(
			(invite) => invite.status === "pending" && invite.expiresAt > now,
		);

		const results = [];
		for (const invite of pending) {
			const startup = await ctx.db.get(invite.startupId);
			const inviter = await ctx.db.get(invite.invitedByUserId);
			results.push({
				_id: invite._id,
				role: invite.role,
				expiresAt: invite.expiresAt,
				startupName: startup?.name ?? "Unknown startup",
				inviterName: inviter?.name ?? inviter?.email ?? "Someone",
			});
		}

		return results;
	},
});

export const getInviteByToken = query({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		const invite = await ctx.db
			.query("invites")
			.withIndex("by_token", (q) => q.eq("token", args.token))
			.unique();

		if (!invite) {
			return null;
		}

		const startup = await ctx.db.get(invite.startupId);
		return { invite, startup };
	},
});

export const acceptInvite = mutation({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const user = await ctx.db.get(userId);
		if (!user?.email) {
			throw new Error("Your account needs an email to accept invites");
		}

		const invite = await ctx.db
			.query("invites")
			.withIndex("by_token", (q) => q.eq("token", args.token))
			.unique();

		if (!invite) {
			throw new Error("Invite not found");
		}

		return await acceptInviteRecord(ctx, invite, userId, user.email);
	},
});

export const acceptInviteById = mutation({
	args: { inviteId: v.id("invites") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const user = await ctx.db.get(userId);
		if (!user?.email) {
			throw new Error("Your account needs an email to accept invites");
		}

		const invite = await ctx.db.get(args.inviteId);
		if (!invite) {
			throw new Error("Invite not found");
		}

		if (invite.email !== user.email.toLowerCase()) {
			throw new Error("This invite was sent to a different email");
		}

		return await acceptInviteRecord(ctx, invite, userId, user.email);
	},
});

async function acceptInviteRecord(
	ctx: MutationCtx,
	invite: Doc<"invites">,
	userId: Id<"users">,
	userEmail: string,
) {
	if (invite.status !== "pending") {
		throw new Error("Invite is no longer valid");
	}

	if (invite.expiresAt < Date.now()) {
		await ctx.db.patch(invite._id, { status: "expired" });
		throw new Error("Invite has expired");
	}

	if (invite.email !== userEmail.toLowerCase()) {
		throw new Error("This invite was sent to a different email");
	}

	const existingMembership = await ctx.db
		.query("memberships")
		.withIndex("by_startupId_and_userId", (q) =>
			q.eq("startupId", invite.startupId).eq("userId", userId),
		)
		.unique();

	if (!existingMembership) {
		await ctx.db.insert("memberships", {
			startupId: invite.startupId,
			userId,
			role: invite.role,
		});
	}

	await ctx.db.patch(invite._id, { status: "accepted" });

	await ctx.db.patch(userId, { activeStartupId: invite.startupId });

	return { startupId: invite.startupId };
}
