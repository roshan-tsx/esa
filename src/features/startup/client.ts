import { queryOptions } from "@tanstack/react-query";
import { getMyStartups } from "~/features/startup/server";

export const startupQueryOptions = () =>
	queryOptions({
		queryKey: ["startup", "mine"],
		queryFn: ({ signal }) => getMyStartups({ signal }),
	});

export type StartupList = Awaited<ReturnType<typeof getMyStartups>>;
