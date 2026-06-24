import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import {
	requireFounderMembership,
	requireMembership,
} from "./lib/membership";

type StartupEntry = {
	startup: Doc<"startups">;
	role: "founder" | "member";
};

async function loadUserStartups(
	ctx: { db: QueryCtx["db"] },
	userId: Id<"users">,
): Promise<StartupEntry[]> {
	const memberships = await ctx.db
		.query("memberships")
		.withIndex("by_userId", (q) => q.eq("userId", userId))
		.take(50);

	const entries: StartupEntry[] = [];
	for (const membership of memberships) {
		const startup = await ctx.db.get(membership.startupId);
		if (startup) {
			entries.push({ startup, role: membership.role });
		}
	}

	entries.sort((a, b) => a.startup.name.localeCompare(b.startup.name));
	return entries;
}

async function resolveWorkspace(
	ctx: { db: QueryCtx["db"] },
	userId: Id<"users">,
	user: Doc<"users"> | null,
) {
	const startups = await loadUserStartups(ctx, userId);

	if (startups.length === 0) {
		return { active: null, startups: [] as StartupEntry[] };
	}

	let active =
		user?.activeStartupId != null
			? (startups.find((s) => s.startup._id === user.activeStartupId) ?? null)
			: null;

	if (!active) {
		active = startups[0];
	}

	return { active, startups };
}

function slugify(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export const create = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		tagline: v.optional(v.string()),
		website: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const baseSlug = slugify(args.name) || "startup";
		let slug = baseSlug;
		let suffix = 1;

		while (true) {
			const collision = await ctx.db
				.query("startups")
				.withIndex("by_slug", (q) => q.eq("slug", slug))
				.unique();

			if (!collision) {
				break;
			}

			slug = `${baseSlug}-${suffix}`;
			suffix += 1;
		}

		const startupId = await ctx.db.insert("startups", {
			name: args.name,
			slug,
			description: args.description,
			tagline: args.tagline,
			website: args.website,
			founderUserId: userId,
		});

		await ctx.db.insert("memberships", {
			startupId,
			userId,
			role: "founder",
		});

		await ctx.db.patch(userId, { activeStartupId: startupId });

		return { startupId, slug };
	},
});

export const getWorkspace = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		const user = await ctx.db.get(userId);
		return await resolveWorkspace(ctx, userId, user);
	},
});

export const setActive = mutation({
	args: { startupId: v.id("startups") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireMembership(ctx, args.startupId, userId);
		await ctx.db.patch(userId, { activeStartupId: args.startupId });
		return args.startupId;
	},
});

/** @deprecated Use getWorkspace — returns the active startup only */
export const getMine = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		const user = await ctx.db.get(userId);
		const { active } = await resolveWorkspace(ctx, userId, user);
		return active;
	},
});

export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("startups")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();
	},
});

export const updatePitch = mutation({
	args: {
		startupId: v.id("startups"),
		pitchProblem: v.optional(v.string()),
		pitchSolution: v.optional(v.string()),
		pitchMarket: v.optional(v.string()),
		pitchTraction: v.optional(v.string()),
		pitchTeam: v.optional(v.string()),
		tagline: v.optional(v.string()),
		description: v.optional(v.string()),
		website: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireFounderMembership(ctx, args.startupId, userId);

		const { startupId, ...fields } = args;
		const patch: Record<string, string | undefined> = {};
		for (const [key, value] of Object.entries(fields)) {
			if (value !== undefined) {
				patch[key] = value.trim() || undefined;
			}
		}

		await ctx.db.patch(startupId, patch);
		return startupId;
	},
});

export const publishPitch = mutation({
	args: { startupId: v.id("startups") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireFounderMembership(ctx, args.startupId, userId);

		const startup = await ctx.db.get(args.startupId);
		if (!startup) {
			throw new Error("Startup not found");
		}

		const pitchProblem =
			startup.pitchProblem ?? startup.description ?? "Problem statement coming soon.";
		const pitchSolution =
			startup.pitchSolution ?? startup.tagline ?? "Solution details coming soon.";

		await ctx.db.patch(args.startupId, {
			isPublic: true,
			publishedAt: Date.now(),
			pitchProblem,
			pitchSolution,
			pitchMarket: startup.pitchMarket ?? undefined,
			pitchTraction: startup.pitchTraction ?? undefined,
			pitchTeam: startup.pitchTeam ?? undefined,
		});

		return { slug: startup.slug };
	},
});

export const unpublishPitch = mutation({
	args: { startupId: v.id("startups") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireFounderMembership(ctx, args.startupId, userId);

		await ctx.db.patch(args.startupId, {
			isPublic: false,
			publishedAt: undefined,
		});
	},
});

export const getPublicPitch = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		const startup = await ctx.db
			.query("startups")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();

		if (!startup?.isPublic) {
			return null;
		}

		const userId = await getAuthUserId(ctx);
		const isAuthenticated = userId !== null;

		let isMember = false;
		if (userId) {
			const membership = await ctx.db
				.query("memberships")
				.withIndex("by_startupId_and_userId", (q) =>
					q.eq("startupId", startup._id).eq("userId", userId),
				)
				.unique();
			isMember = membership !== null;
		}

		const canViewFull = isAuthenticated;

		return {
			name: startup.name,
			slug: startup.slug,
			tagline: startup.tagline ?? null,
			website: startup.website ?? null,
			publishedAt: startup.publishedAt ?? null,
			canViewFull,
			isMember,
			full: canViewFull
				? {
						description: startup.description ?? null,
						pitchProblem: startup.pitchProblem ?? null,
						pitchSolution: startup.pitchSolution ?? null,
						pitchMarket: startup.pitchMarket ?? null,
						pitchTraction: startup.pitchTraction ?? null,
						pitchTeam: startup.pitchTeam ?? null,
					}
				: null,
		};
	},
});

export const listPublic = query({
	args: {},
	handler: async (ctx) => {
		const startups = await ctx.db
			.query("startups")
			.withIndex("by_isPublic", (q) => q.eq("isPublic", true))
			.take(50);

		return startups.map((s) => ({
			_id: s._id,
			name: s.name,
			slug: s.slug,
			tagline: s.tagline ?? null,
			publishedAt: s.publishedAt ?? null,
		}));
	},
});
