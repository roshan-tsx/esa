import { betterAuth } from "better-auth/minimal";
import { createMiddleware, createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "~/db";
import { env } from "~/env/server";

export const getBetterAuth = createServerOnlyFn(() =>
	betterAuth({
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
	}),
);

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
	const session = await getBetterAuth().api.getSession({ headers: request.headers });
	if (!session) throw new Response("Unauthorized", { status: 401 });
	return next({ context: { user: session.user, session: session.session } });
});

export const optionalAuthMiddleware = createMiddleware().server(async ({ next, request }) => {
	const session = await getBetterAuth().api.getSession({ headers: request.headers });
	return next({
		context: {
			user: session?.user ?? null,
			session: session?.session ?? null,
		},
	});
});

export const getSessionFn = createServerFn()
	.middleware([authMiddleware])
	.handler(({ context }) => ({ user: context.user, session: context.session }));

export const getSessionOptionalFn = createServerFn()
	.middleware([optionalAuthMiddleware])
	.handler(({ context }) => {
		if (!context.session || !context.user) return null;
		return { user: context.user, session: context.session };
	});
