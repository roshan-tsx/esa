import { queryOptions } from "@tanstack/react-query";
import { getMyProfile } from "~/features/profile/server";

export const profileQueryOptions = () =>
	queryOptions({
		queryKey: ["profile", "me"],
		queryFn: ({ signal }) => getMyProfile({ signal }),
	});

export type ProfileType = Awaited<ReturnType<typeof getMyProfile>>;
