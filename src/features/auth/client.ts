import { queryOptions, useQuery } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";
import { env } from "~/env/client";
import { getSessionFn, getSessionOptionalFn } from "~/features/auth/server";

export const authClient = createAuthClient({ baseURL: env.VITE_BASE_URL });

export type Session = NonNullable<Awaited<ReturnType<typeof getSessionFn>>>;

export const sessionQueryOptions = () =>
	queryOptions({
		queryKey: ["auth", "session"],
		queryFn: ({ signal }) => getSessionFn({ signal }),
		retry: false,
	});

export function useSession() {
	return useQuery(sessionQueryOptions());
}

export function useSessionOptional() {
	return useQuery({
		queryKey: ["auth", "session", "optional"],
		queryFn: ({ signal }) => getSessionOptionalFn({ signal }),
		retry: false,
	});
}
