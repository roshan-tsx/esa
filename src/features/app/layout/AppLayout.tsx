import { useConvexAuth } from "@convex-dev/auth/react";
import { Navigate, Outlet } from "@tanstack/react-router";
import { GlobalSpinner } from "~/components/globals/GlobalSpinner";
import { AppShell } from "./AppShell";

export function AppLayout() {
	const { isLoading, isAuthenticated } = useConvexAuth();

	if (isLoading) {
		return <GlobalSpinner />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/" />;
	}

	return (
		<AppShell>
			<Outlet />
		</AppShell>
	);
}
