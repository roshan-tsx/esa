import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShellSkeleton } from "~/features/application/components/AppShellSkeleton";
import { Header } from "~/features/application/components/Header";
import { BottomBar } from "~/features/application/components/Navigation";
import { Onboarding } from "~/features/profile/components/Onboarding";
import { loadAppContextFn } from "~/features/profile/server";

export const Route = createFileRoute("/app")({
	beforeLoad: async () => {
		const ctx = await loadAppContextFn();
		if (!ctx.session) throw redirect({ to: "/" });
		return ctx;
	},
	component: AppLayout,
	pendingComponent: AppShellSkeleton,
});

function AppLayout() {
	const { session, profile } = Route.useRouteContext();

	if (!profile) {
		return <Onboarding user={session.user} />;
	}

	return (
		<div className="min-h-screen w-screen flex flex-col p-2 gap-2">
			<Header />
			<Outlet />
			<BottomBar />
		</div>
	);
}
