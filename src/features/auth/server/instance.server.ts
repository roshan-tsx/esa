import { betterAuth } from "better-auth/minimal";
import { createServerOnlyFn } from "@tanstack/react-start";
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
