import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { initUserProfile, isProUser, requireUserId } from "./lib/auth";
import { requireFounderMembership, requireMembership } from "./lib/membership";
import {
	DAY_MS,
	FREE_DAILY_APPLICATION_LIMIT,
	utcDateString,
	WEEK_MS,
} from "./lib/time";

type SprintCtx = QueryCtx | MutationCtx;

async function getSprintOrThrow(ctx: SprintCtx, sprintId: Id<"hiringSprints">) {
	const sprint = await ctx.db.get(sprintId);
	if (!sprint) {
		throw new Error("Sprint not found");
	}
	return sprint;
}

async function refreshSprintStatus(
	ctx: MutationCtx,
	sprintId: Id<"hiringSprints">,
) {
	const sprint = await getSprintOrThrow(ctx, sprintId);
	if (sprint.status === "completed") {
		return sprint;
	}
	if (Date.now() > sprint.expiresAt && sprint.status !== "expired") {
		await ctx.db.patch(sprintId, { status: "expired" });
		return { ...sprint, status: "expired" as const };
	}
	return sprint;
}

async function countJoinedCandidates(
	ctx: SprintCtx,
	sprintId: Id<"hiringSprints">,
) {
	const applications = await ctx.db
		.query("sprintApplications")
		.withIndex("by_sprintId", (q) => q.eq("sprintId", sprintId))
		.collect();

	return applications.filter(
		(a) => a.status === "joined" || a.status === "accepted",
	).length;
}

async function getTodayApplicationCount(
	ctx: SprintCtx,
	userId: Id<"users">,
) {
	const today = utcDateString();
	const applications = await ctx.db
		.query("sprintApplications")
		.withIndex("by_userId_and_applicationDate", (q) =>
			q.eq("userId", userId).eq("applicationDate", today),
		)
		.collect();

	return applications.filter(
		(a) =>
			a.status === "joined" ||
			a.status === "applied" ||
			a.status === "accepted",
	).length;
}

async function closeOtherApplications(
	ctx: MutationCtx,
	userId: Id<"users">,
	exceptSprintId: Id<"hiringSprints">,
) {
	const applications = await ctx.db
		.query("sprintApplications")
		.withIndex("by_userId", (q) => q.eq("userId", userId))
		.collect();

	for (const app of applications) {
		if (
			app.sprintId !== exceptSprintId &&
			(app.status === "applied" || app.status === "joined")
		) {
			await ctx.db.patch(app._id, {
				status: "closed",
				closedReason: "joined_other_sprint",
			});
		}
	}
}

async function enrichSprint(ctx: SprintCtx, sprint: DocSprint) {
	const startup = await ctx.db.get(sprint.startupId);
	const joinedCount = await countJoinedCandidates(ctx, sprint._id);
	const now = Date.now();
	const phase =
		sprint.status === "expired" || now > sprint.expiresAt
			? "expired"
			: sprint.status === "completed"
				? "completed"
				: sprint.status === "active"
					? "active"
					: now < sprint.directJoinEndsAt
						? "direct_join"
						: "apply_only";

	return {
		...sprint,
		startupName: startup?.name ?? "Unknown",
		startupSlug: startup?.slug ?? "",
		joinedCount,
		phase,
		isFull: joinedCount >= sprint.maxCandidates,
	};
}

type DocSprint = NonNullable<Awaited<ReturnType<typeof getSprintOrThrow>>>;

async function enrichApplication(
	ctx: SprintCtx,
	app: {
		_id: Id<"sprintApplications">;
		sprintId: Id<"hiringSprints">;
		userId: Id<"users">;
		status: string;
		type: string;
		appliedAt: number;
	},
) {
	const user = await ctx.db.get(app.userId);
	return {
		...app,
		user: user
			? {
					_id: user._id,
					name: user.name ?? null,
					email: user.email ?? null,
				}
			: null,
	};
}

export const create = mutation({
	args: {
		startupId: v.id("startups"),
		title: v.string(),
		description: v.string(),
		role: v.string(),
		taskTitles: v.array(v.string()),
		rankingCriteria: v.optional(v.string()),
		perks: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireFounderMembership(ctx, args.startupId, userId);

		const title = args.title.trim();
		const description = args.description.trim();
		const role = args.role.trim();
		if (!title || !description || !role) {
			throw new Error("Title, description, and role are required");
		}

		const tasks = args.taskTitles.map((t) => t.trim()).filter(Boolean);
		if (tasks.length === 0) {
			throw new Error("Add at least one task");
		}

		const now = Date.now();
		return await ctx.db.insert("hiringSprints", {
			startupId: args.startupId,
			founderUserId: userId,
			title,
			description,
			role,
			taskTitles: tasks,
			rankingCriteria: args.rankingCriteria?.trim() || undefined,
			perks: args.perks?.trim() || undefined,
			maxCandidates: 10,
			status: "open",
			postedAt: now,
			expiresAt: now + WEEK_MS,
			directJoinEndsAt: now + DAY_MS,
		});
	},
});

export const listMine = query({
	args: { startupId: v.id("startups") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireMembership(ctx, args.startupId, userId);

		const sprints = await ctx.db
			.query("hiringSprints")
			.withIndex("by_startupId", (q) => q.eq("startupId", args.startupId))
			.collect();

		sprints.sort((a, b) => b.postedAt - a.postedAt);

		const enriched = [];
		for (const sprint of sprints) {
			enriched.push(await enrichSprint(ctx, sprint));
		}
		return enriched;
	},
});

export const listOpen = query({
	args: {},
	handler: async (ctx) => {
		const sprints = await ctx.db
			.query("hiringSprints")
			.withIndex("by_status", (q) => q.eq("status", "open"))
			.take(50);

		const active = await ctx.db
			.query("hiringSprints")
			.withIndex("by_status", (q) => q.eq("status", "active"))
			.take(50);

		const all = [...sprints, ...active].filter((s) => Date.now() <= s.expiresAt);
		all.sort((a, b) => b.postedAt - a.postedAt);

		const enriched = [];
		for (const sprint of all) {
			enriched.push(await enrichSprint(ctx, sprint));
		}
		return enriched;
	},
});

export const get = query({
	args: { sprintId: v.id("hiringSprints") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const sprint = await getSprintOrThrow(ctx, args.sprintId);
		const enriched = await enrichSprint(ctx, sprint);

		const myApplication = await ctx.db
			.query("sprintApplications")
			.withIndex("by_sprintId_and_userId", (q) =>
				q.eq("sprintId", args.sprintId).eq("userId", userId),
			)
			.unique();

		let isFounder = false;
		try {
			await requireFounderMembership(ctx, sprint.startupId, userId);
			isFounder = true;
		} catch {
			isFounder = false;
		}

		const applications = isFounder
			? await ctx.db
					.query("sprintApplications")
					.withIndex("by_sprintId", (q) => q.eq("sprintId", args.sprintId))
					.collect()
			: [];

		const enrichedApps = [];
		for (const app of applications) {
			enrichedApps.push(await enrichApplication(ctx, app));
		}

		const todayCount = await getTodayApplicationCount(ctx, userId);
		const pro = await isProUser(ctx, userId);

		return {
			sprint: enriched,
			myApplication,
			isFounder,
			applications: enrichedApps,
			applicationLimit: {
				used: todayCount,
				max: pro ? null : FREE_DAILY_APPLICATION_LIMIT,
				isPro: pro,
			},
		};
	},
});

export const getPublic = query({
	args: { sprintId: v.id("hiringSprints") },
	handler: async (ctx, args) => {
		const sprint = await getSprintOrThrow(ctx, args.sprintId);
		if (sprint.status === "expired" || Date.now() > sprint.expiresAt) {
			return null;
		}
		return await enrichSprint(ctx, sprint);
	},
});

export const startSprint = mutation({
	args: { sprintId: v.id("hiringSprints") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const sprint = await refreshSprintStatus(ctx, args.sprintId);

		if (sprint.founderUserId !== userId) {
			throw new Error("Only the founder can start the sprint");
		}

		if (sprint.status === "expired" || sprint.status === "completed") {
			throw new Error("Sprint is no longer active");
		}

		const joinedCount = await countJoinedCandidates(ctx, args.sprintId);
		if (joinedCount === 0) {
			throw new Error("Need at least one candidate to start");
		}

		await ctx.db.patch(args.sprintId, {
			status: "active",
			startedAt: Date.now(),
		});
	},
});

export const directJoin = mutation({
	args: { sprintId: v.id("hiringSprints") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await initUserProfile(ctx, userId);

		const sprint = await refreshSprintStatus(ctx, args.sprintId);
		if (sprint.status === "expired" || sprint.status === "completed") {
			throw new Error("Sprint is closed");
		}
		if (Date.now() > sprint.expiresAt) {
			throw new Error("Sprint has expired");
		}
		if (Date.now() > sprint.directJoinEndsAt) {
			throw new Error("Direct join period ended. Apply instead.");
		}

		const joinedCount = await countJoinedCandidates(ctx, args.sprintId);
		if (joinedCount >= sprint.maxCandidates) {
			throw new Error("Sprint is full");
		}

		const existing = await ctx.db
			.query("sprintApplications")
			.withIndex("by_sprintId_and_userId", (q) =>
				q.eq("sprintId", args.sprintId).eq("userId", userId),
			)
			.unique();
		if (existing && existing.status !== "closed" && existing.status !== "rejected") {
			throw new Error("You already applied to this sprint");
		}

		const pro = await isProUser(ctx, userId);
		if (!pro) {
			const todayCount = await getTodayApplicationCount(ctx, userId);
			if (todayCount >= FREE_DAILY_APPLICATION_LIMIT) {
				throw new Error(
					`Free plan allows ${FREE_DAILY_APPLICATION_LIMIT} sprint applications per day. Upgrade to Pro for unlimited.`,
				);
			}
		}

		const now = Date.now();
		await ctx.db.insert("sprintApplications", {
			sprintId: args.sprintId,
			userId,
			status: "joined",
			type: "direct",
			appliedAt: now,
			applicationDate: utcDateString(now),
		});

		await closeOtherApplications(ctx, userId, args.sprintId);
	},
});

export const apply = mutation({
	args: { sprintId: v.id("hiringSprints") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await initUserProfile(ctx, userId);

		const sprint = await refreshSprintStatus(ctx, args.sprintId);
		if (sprint.status === "expired" || sprint.status === "completed") {
			throw new Error("Sprint is closed");
		}
		if (Date.now() > sprint.expiresAt) {
			throw new Error("Sprint has expired");
		}
		if (Date.now() < sprint.directJoinEndsAt) {
			throw new Error("Direct join is still open. Join directly instead.");
		}

		const joinedCount = await countJoinedCandidates(ctx, args.sprintId);
		if (joinedCount >= sprint.maxCandidates) {
			throw new Error("Sprint is full");
		}

		const existing = await ctx.db
			.query("sprintApplications")
			.withIndex("by_sprintId_and_userId", (q) =>
				q.eq("sprintId", args.sprintId).eq("userId", userId),
			)
			.unique();
		if (existing && existing.status !== "closed" && existing.status !== "rejected") {
			throw new Error("You already applied to this sprint");
		}

		const pro = await isProUser(ctx, userId);
		if (!pro) {
			const todayCount = await getTodayApplicationCount(ctx, userId);
			if (todayCount >= FREE_DAILY_APPLICATION_LIMIT) {
				throw new Error(
					`Free plan allows ${FREE_DAILY_APPLICATION_LIMIT} sprint applications per day. Upgrade to Pro for unlimited.`,
				);
			}
		}

		const now = Date.now();
		await ctx.db.insert("sprintApplications", {
			sprintId: args.sprintId,
			userId,
			status: "applied",
			type: "apply",
			appliedAt: now,
			applicationDate: utcDateString(now),
		});
	},
});

export const acceptApplication = mutation({
	args: { applicationId: v.id("sprintApplications") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const application = await ctx.db.get(args.applicationId);
		if (!application) {
			throw new Error("Application not found");
		}

		const sprint = await getSprintOrThrow(ctx, application.sprintId);
		if (sprint.founderUserId !== userId) {
			throw new Error("Only the founder can accept applications");
		}
		if (application.status !== "applied") {
			throw new Error("Application is not pending");
		}

		const joinedCount = await countJoinedCandidates(ctx, application.sprintId);
		if (joinedCount >= sprint.maxCandidates) {
			throw new Error("Sprint is full");
		}

		await ctx.db.patch(args.applicationId, { status: "joined" });
		await closeOtherApplications(ctx, application.userId, application.sprintId);
	},
});

export const rejectApplication = mutation({
	args: { applicationId: v.id("sprintApplications") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const application = await ctx.db.get(args.applicationId);
		if (!application) {
			throw new Error("Application not found");
		}

		const sprint = await getSprintOrThrow(ctx, application.sprintId);
		if (sprint.founderUserId !== userId) {
			throw new Error("Only the founder can reject applications");
		}

		await ctx.db.patch(args.applicationId, { status: "rejected" });
	},
});

export const hire = mutation({
	args: {
		sprintId: v.id("hiringSprints"),
		candidateUserId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const sprint = await getSprintOrThrow(ctx, args.sprintId);

		if (sprint.founderUserId !== userId) {
			throw new Error("Only the founder can hire from a sprint");
		}

		const application = await ctx.db
			.query("sprintApplications")
			.withIndex("by_sprintId_and_userId", (q) =>
				q.eq("sprintId", args.sprintId).eq("userId", args.candidateUserId),
			)
			.unique();

		if (
			!application ||
			(application.status !== "joined" && application.status !== "accepted")
		) {
			throw new Error("Candidate is not part of this sprint");
		}

		await ctx.db.patch(args.sprintId, {
			status: "completed",
			hiredUserId: args.candidateUserId,
		});
	},
});

export const listMessages = query({
	args: { sprintId: v.id("hiringSprints") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const sprint = await getSprintOrThrow(ctx, args.sprintId);

		const isFounder = sprint.founderUserId === userId;
		const myApp = await ctx.db
			.query("sprintApplications")
			.withIndex("by_sprintId_and_userId", (q) =>
				q.eq("sprintId", args.sprintId).eq("userId", userId),
			)
			.unique();

		const isCandidate =
			myApp?.status === "joined" || myApp?.status === "accepted";

		if (!isFounder && !isCandidate) {
			throw new Error("You are not part of this sprint chat");
		}

		if (sprint.status !== "active" && sprint.status !== "completed") {
			throw new Error("Chat is only available during active sprints");
		}

		const messages = await ctx.db
			.query("sprintMessages")
			.withIndex("by_sprintId", (q) => q.eq("sprintId", args.sprintId))
			.collect();

		messages.sort((a, b) => a.createdAt - b.createdAt);

		const enriched = [];
		for (const msg of messages) {
			const user = await ctx.db.get(msg.userId);
			enriched.push({
				...msg,
				user: user
					? { _id: user._id, name: user.name ?? null, email: user.email ?? null }
					: null,
			});
		}

		return enriched;
	},
});

export const sendMessage = mutation({
	args: {
		sprintId: v.id("hiringSprints"),
		content: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const sprint = await getSprintOrThrow(ctx, args.sprintId);

		const content = args.content.trim();
		if (!content) {
			throw new Error("Message cannot be empty");
		}

		const isFounder = sprint.founderUserId === userId;
		const myApp = await ctx.db
			.query("sprintApplications")
			.withIndex("by_sprintId_and_userId", (q) =>
				q.eq("sprintId", args.sprintId).eq("userId", userId),
			)
			.unique();

		const isCandidate =
			myApp?.status === "joined" || myApp?.status === "accepted";

		if (!isFounder && !isCandidate) {
			throw new Error("You are not part of this sprint chat");
		}

		if (sprint.status !== "active") {
			throw new Error("Chat is only available during active sprints");
		}

		await ctx.db.insert("sprintMessages", {
			sprintId: args.sprintId,
			userId,
			content,
			createdAt: Date.now(),
		});
	},
});

export const updateDetails = mutation({
	args: {
		sprintId: v.id("hiringSprints"),
		rankingCriteria: v.optional(v.string()),
		perks: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const sprint = await getSprintOrThrow(ctx, args.sprintId);

		if (sprint.founderUserId !== userId) {
			throw new Error("Only the founder can update sprint details");
		}

		await ctx.db.patch(args.sprintId, {
			rankingCriteria: args.rankingCriteria?.trim() || undefined,
			perks: args.perks?.trim() || undefined,
		});
	},
});
