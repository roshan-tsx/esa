import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import {
	requireFounderMembership,
} from "./lib/membership";

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

		const existingStartup = await ctx.db
			.query("startups")
			.withIndex("by_founderUserId", (q) => q.eq("founderUserId", userId))
			.first();

		if (existingStartup) {
			throw new Error("You already have a startup");
		}

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

		return { startupId, slug };
	},
});

export const getMine = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);

		const membership = await ctx.db
			.query("memberships")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		if (!membership) {
			return null;
		}

		const startup = await ctx.db.get(membership.startupId);
		if (!startup) {
			return null;
		}

		return {
			startup,
			role: membership.role,
		};
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
