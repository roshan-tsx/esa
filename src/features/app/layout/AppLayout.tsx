import { useConvexAuth } from "@convex-dev/auth/react";
import { Navigate, Outlet } from "@tanstack/react-router";
import { GlobalSpinner } from "~/components/globals/GlobalSpinner";

export function AppLayout() {
	const { isLoading, isAuthenticated } = useConvexAuth();

	if (isLoading) {
		return <GlobalSpinner />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/" />;
	}

	return <Outlet />;
}
