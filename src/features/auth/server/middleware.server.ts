import { createMiddleware } from "@tanstack/react-start";
import { getBetterAuth } from "~/features/auth/server/instance.server";

export const authMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const session = await getBetterAuth().api.getSession({
			headers: request.headers,
		});

		if (!session) {
			throw new Response("Unauthorized", { status: 401 });
		}

		return next({
			context: {
				user: session.user,
				session: session.session,
			},
		});
	},
);

export const optionalAuthMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const session = await getBetterAuth().api.getSession({
			headers: request.headers,
		});

		return next({
			context: {
				user: session?.user ?? null,
				session: session?.session ?? null,
			},
		});
	},
);
