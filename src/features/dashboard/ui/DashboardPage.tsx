import { PageLoading } from "~/components/shared/PageLoading";
import { EmptyDashboard } from "~/features/dashboard/components/EmptyDashboard";
import { FounderHub } from "~/features/dashboard/components/FounderHub";
import { useWorkspace } from "~/features/app/hooks/useWorkspace";

export function DashboardPage() {
	const { active: startup, isLoading } = useWorkspace();

	if (isLoading) {
		return <PageLoading />;
	}

	if (!startup) {
		return <EmptyDashboard />;
	}

	return <FounderHub />;
}
