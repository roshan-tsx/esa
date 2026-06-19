import { queryOptions, useQuery } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";
import { env } from "~/env/client";
import { getMeFn, getMeOptionalFn } from "~/features/auth/server";

export const authClient = createAuthClient({
	baseURL: env.VITE_BASE_URL,
});

export type Me = NonNullable<Awaited<ReturnType<typeof getMeFn>>>;

export const meQueryOptions = () =>
	queryOptions({
		queryKey: ["auth", "me"],
		queryFn: ({ signal }) => getMeFn({ signal }),
		retry: false,
	});

export const meOptionalQueryOptions = () =>
	queryOptions({
		queryKey: ["auth", "me", "optional"],
		queryFn: ({ signal }) => getMeOptionalFn({ signal }),
		retry: false,
	});

export function useMeOptional() {
	return useQuery(meOptionalQueryOptions());
}

export function useMe() {
	return useQuery(meQueryOptions());
}
