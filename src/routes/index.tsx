import { createFileRoute, redirect } from "@tanstack/react-router";
import { loadAppContextFn } from "~/features/profile/server";
import { LandingPage } from "~/features/landing/components/LandingPage";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const { session } = await loadAppContextFn();
		if (session) throw redirect({ to: "/app/dashboard" });
	},
	component: LandingPage,
});
