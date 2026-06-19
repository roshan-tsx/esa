import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { createServerFn } from "@tanstack/react-start";
import { db, startupTable } from "~/db";
import { authMiddleware } from "~/features/auth/server";

const startupInputSchema = createInsertSchema(startupTable);

export const createStartup = createServerFn({ method: "POST" })
	.inputValidator(startupInputSchema.omit({ id: true, owner_id: true }))
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		const { user } = context;
		const { name, description, cin, industry } = data;
		await db
			.insert(startupTable)
			.values({ name, description, owner_id: user.id, cin, industry })
			.returning();
	});

export const getMyStartups = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const { user } = context;
		const startups = await db.query.startupTable.findMany({
			where: eq(startupTable.owner_id, user.id),
		});
		return startups;
	});
