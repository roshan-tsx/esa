import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { db, profileTable } from "~/db";
import { authMiddleware, optionalAuthMiddleware } from "~/features/auth/lib";

export const getMeFn = createServerFn()
	.middleware([authMiddleware])
	.handler(({ context }) => {
		const { session, user } = context;
		return { session, user };
	});

export const getMeOptionalFn = createServerFn()
	.middleware([optionalAuthMiddleware])
	.handler(({ context }) => {
		const { session, user } = context;
		if (!session || !user) {
			return null;
		}
		return { session, user };
	});

/** Single loader for all authenticated routes — session + profile in one trip. */
export const loadAppContextFn = createServerFn()
	.middleware([optionalAuthMiddleware])
	.handler(async ({ context }) => {
		const { session, user } = context;
		if (!session || !user) {
			return { me: null, profile: null };
		}

		const profile = await db.query.profileTable.findFirst({
			where: eq(profileTable.id, user.id),
		});

		return {
			me: { session, user },
			profile: profile ?? null,
		};
	});
