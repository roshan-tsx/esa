import { createFileRoute, redirect } from "@tanstack/react-router";
import { loadAppContextFn } from "~/features/auth/server";
import { LandingPage } from "~/features/landing/components/LandingPage";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const { me } = await loadAppContextFn();
		if (me) {
			throw redirect({ to: "/app/dashboard" });
		}
	},
	component: LandingPage,
});
