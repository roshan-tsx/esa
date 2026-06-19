import { betterAuth } from "better-auth/minimal";
import { createMiddleware, createServerOnlyFn } from "@tanstack/react-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "~/db";
import { env } from "~/env/server";

export const getBetterAuth = createServerOnlyFn(() => {
	return betterAuth({
		baseURL: env.BASE_URL,
		secret: env.BETTER_AUTH_SECRET,
		telemetry: { enabled: false },
		database: drizzleAdapter(db, { provider: "pg" }),
		plugins: [tanstackStartCookies()],
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
	});
});

export const authMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const auth = getBetterAuth();
		const obj = await auth.api.getSession({
			headers: request.headers,
		});

		if (!obj) {
			throw new Response("Unauthorized", { status: 401 });
		}
		return next({
			context: {
				user: obj.user,
				session: obj.session,
			},
		});
	},
);

export const optionalAuthMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const auth = getBetterAuth();
		const obj = await auth.api.getSession({
			headers: request.headers,
		});

		return next({
			context: {
				user: obj?.user ?? null,
				session: obj?.session ?? null,
			},
		});
	},
);
