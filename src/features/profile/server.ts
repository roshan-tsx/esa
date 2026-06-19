import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { createServerFn } from "@tanstack/react-start";
import { db, profileTable } from "~/db";
import { authMiddleware } from "~/features/auth/lib";

const ProfileSchema = createInsertSchema(profileTable);

export const getMyProfile = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const { user } = context;
		const profile = await db.query.profileTable.findFirst({
			where: eq(profileTable.id, user.id),
		});

		return profile ?? null;
	});

export const createMyProfile = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		ProfileSchema.omit({
			id: true,
			email: true,
			avatar_url: true,
		}),
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
		} catch (err) {
			console.error("Profile creation failed:", err);
			throw new Response("Username already taken", { status: 400 });
		}

		const profile = await db.query.profileTable.findFirst({
			where: eq(profileTable.id, user.id),
		});

		return profile;
	});

export const updateMyProfile = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		ProfileSchema.pick({
			full_name: true,
			username: true,
		}).partial(),
	)
	.handler(async ({ data, context }) => {
		const { user } = context;

		try {
			await db
				.update(profileTable)
				.set({ ...data })
				.where(eq(profileTable.id, user.id));
		} catch (err) {
			console.error("Profile update failed:", err);
			throw new Response("Update failed", { status: 400 });
		}

		const updatedProfile = await db.query.profileTable.findFirst({
			where: eq(profileTable.id, user.id),
		});

		return updatedProfile;
	});
