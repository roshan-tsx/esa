import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { requireMembership } from "./lib/membership";

export const list = query({
	args: { startupId: v.id("startups") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireMembership(ctx, args.startupId, userId);

		const tasks = await ctx.db
			.query("tasks")
			.withIndex("by_startupId", (q) => q.eq("startupId", args.startupId))
			.collect();

		tasks.sort((a, b) => a.order - b.order);

		const enriched = [];
		for (const task of tasks) {
			let assignee = null;
			if (task.assigneeUserId) {
				const user = await ctx.db.get(task.assigneeUserId);
				if (user) {
					assignee = {
						_id: user._id,
						name: user.name ?? null,
						email: user.email ?? null,
						image: user.image ?? null,
					};
				}
			}
			enriched.push({ ...task, assignee });
		}

		return enriched;
	},
});

export const create = mutation({
	args: {
		startupId: v.id("startups"),
		title: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		await requireMembership(ctx, args.startupId, userId);

		const title = args.title.trim();
		if (!title) {
			throw new Error("Task title is required");
		}

		const existing = await ctx.db
			.query("tasks")
			.withIndex("by_startupId", (q) => q.eq("startupId", args.startupId))
			.collect();

		const maxOrder = existing.reduce((max, t) => Math.max(max, t.order), 0);

		return await ctx.db.insert("tasks", {
			startupId: args.startupId,
			title,
			description: args.description?.trim() || undefined,
			status: "todo",
			createdByUserId: userId,
			order: maxOrder + 1,
		});
	},
});

export const remove = mutation({
	args: { taskId: v.id("tasks") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new Error("Task not found");
		}

		await requireMembership(ctx, task.startupId, userId);
		await ctx.db.delete(args.taskId);
	},
});

export const assignToMe = mutation({
	args: { taskId: v.id("tasks") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new Error("Task not found");
		}

		await requireMembership(ctx, task.startupId, userId);

		await ctx.db.patch(args.taskId, {
			assigneeUserId: userId,
			status: task.status === "done" ? "done" : "in_progress",
		});
	},
});

export const toggleComplete = mutation({
	args: { taskId: v.id("tasks") },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new Error("Task not found");
		}

		await requireMembership(ctx, task.startupId, userId);

		const isDone = task.status === "done";
		await ctx.db.patch(args.taskId, {
			status: isDone ? "todo" : "done",
		});
	},
});
