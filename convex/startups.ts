import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

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
