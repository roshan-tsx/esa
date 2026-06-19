import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShellSkeleton } from "~/features/application/components/AppShellSkeleton";
import { Header } from "~/features/application/components/Header";
import { BottomBar } from "~/features/application/components/Navigation";
import { loadAppContextFn } from "~/features/auth/server";
import { OnboardingScreen } from "~/features/profile/components/OnboardingScreen";

export const Route = createFileRoute("/app")({
	beforeLoad: async () => {
		const ctx = await loadAppContextFn();
		if (!ctx.me) {
			throw redirect({ to: "/" });
		}
		return ctx;
	},
	component: AppLayout,
	pendingComponent: AppShellSkeleton,
});

function AppLayout() {
	const { me, profile } = Route.useRouteContext();

	if (!profile) {
		return <OnboardingScreen user={me.user} />;
	}

	return (
		<div className="min-h-screen w-screen flex flex-col p-2 gap-2">
			<Header />
			<Outlet />
			<BottomBar />
		</div>
	);
}
