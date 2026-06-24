import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isProUser } from "./lib/auth";
import { FREE_DAILY_APPLICATION_LIMIT } from "./lib/time";

function matchesSearch(text: string, search: string) {
	return text.toLowerCase().includes(search.toLowerCase());
}

export const search = query({
	args: {
		search: v.optional(v.string()),
		role: v.optional(v.string()),
		tab: v.optional(
			v.union(v.literal("all"), v.literal("startups"), v.literal("sprints")),
		),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		const searchTerm = args.search?.trim() ?? "";
		const roleFilter = args.role?.trim() ?? "";
		const tab = args.tab ?? "all";

		let pro = false;
		let applicationLimit = null;
		if (userId) {
			pro = await isProUser(ctx, userId);
			applicationLimit = pro ? null : FREE_DAILY_APPLICATION_LIMIT;
		}

		const startups =
			tab === "sprints"
				? []
				: await ctx.db
						.query("startups")
						.withIndex("by_isPublic", (q) => q.eq("isPublic", true))
						.take(100);

		const openSprints =
			tab === "startups"
				? []
				: await ctx.db
						.query("hiringSprints")
						.withIndex("by_status", (q) => q.eq("status", "open"))
						.take(100);

		const activeSprints =
			tab === "startups"
				? []
				: await ctx.db
						.query("hiringSprints")
						.withIndex("by_status", (q) => q.eq("status", "active"))
						.take(100);

		const sprints = [...openSprints, ...activeSprints].filter(
			(s) => Date.now() <= s.expiresAt,
		);

		const filteredStartups = [];
		for (const startup of startups) {
			if (roleFilter) {
				const roleHaystack = [startup.description ?? "", startup.tagline ?? ""].join(
					" ",
				);
				if (!matchesSearch(roleHaystack, roleFilter)) continue;
			}
			if (searchTerm) {
				const haystack = [
					startup.name,
					startup.tagline ?? "",
					startup.description ?? "",
				].join(" ");
				if (!matchesSearch(haystack, searchTerm)) continue;
			}
			filteredStartups.push({
				_id: startup._id,
				name: startup.name,
				slug: startup.slug,
				tagline: startup.tagline ?? null,
				description: startup.description ?? null,
			});
		}

		const filteredSprints = [];
		for (const sprint of sprints) {
			if (roleFilter && !matchesSearch(sprint.role, roleFilter)) {
				continue;
			}
			if (searchTerm) {
				const haystack = [
					sprint.title,
					sprint.description,
					sprint.role,
					...sprint.taskTitles,
				].join(" ");
				if (!matchesSearch(haystack, searchTerm)) continue;
			}

			const startup = await ctx.db.get(sprint.startupId);
			const applications = await ctx.db
				.query("sprintApplications")
				.withIndex("by_sprintId", (q) => q.eq("sprintId", sprint._id))
				.collect();
			const joinedCount = applications.filter(
				(a) => a.status === "joined" || a.status === "accepted",
			).length;

			const now = Date.now();
			const phase =
				now < sprint.directJoinEndsAt ? "direct_join" : "apply_only";

			filteredSprints.push({
				_id: sprint._id,
				title: sprint.title,
				description: sprint.description,
				role: sprint.role,
				taskTitles: sprint.taskTitles,
				startupName: startup?.name ?? "Unknown",
				startupSlug: startup?.slug ?? "",
				joinedCount,
				maxCandidates: sprint.maxCandidates,
				phase,
				isFull: joinedCount >= sprint.maxCandidates,
				expiresAt: sprint.expiresAt,
				postedAt: sprint.postedAt,
				status: sprint.status,
			});
		}

		filteredSprints.sort((a, b) => b.postedAt - a.postedAt);

		return {
			startups: filteredStartups,
			sprints: filteredSprints,
			isAuthenticated: userId !== null,
			applicationLimit,
			isPro: pro,
		};
	},
});
