import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { createServerFn } from "@tanstack/react-start";
import { db, profileTable } from "~/db";
import {
	authMiddleware,
	optionalAuthMiddleware,
} from "~/features/auth/server";

const ProfileSchema = createInsertSchema(profileTable);

async function findProfile(userId: string) {
	const row = await db.query.profileTable.findFirst({
		where: eq(profileTable.id, userId),
	});
	return row ?? null;
}

export const loadAppContextFn = createServerFn()
	.middleware([optionalAuthMiddleware])
	.handler(async ({ context }) => {
		if (!context.session || !context.user) {
			return { session: null, profile: null };
		}
		return {
			session: { user: context.user, session: context.session },
			profile: await findProfile(context.user.id),
		};
	});

export const getMyProfile = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => findProfile(context.user.id));

export const createMyProfile = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		ProfileSchema.omit({ id: true, email: true, avatar_url: true }),
	)
	.handler(async ({ data, context }) => {
		const { user } = context;
		try {
			await db.insert(profileTable).values({
				id: user.id,
				email: user.email,
				full_name: data.full_name,
				username: data.username,
				avatar_url: user.image,
			});
		} catch {
			throw new Response("Username already taken", { status: 400 });
		}
		return findProfile(user.id);
	});

export const updateMyProfile = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		ProfileSchema.pick({ full_name: true, username: true }).partial(),
	)
	.handler(async ({ data, context }) => {
		try {
			await db
				.update(profileTable)
				.set(data)
				.where(eq(profileTable.id, context.user.id));
		} catch {
			throw new Response("Update failed", { status: 400 });
		}
		return findProfile(context.user.id);
	});
