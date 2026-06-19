import { Skeleton } from "~/components/ui/skeleton";
import { HeaderSkeleton } from "./HeaderSkeleton";

export function AppShellSkeleton() {
	return (
		<div className="min-h-screen w-screen flex flex-col p-2 gap-2">
			<HeaderSkeleton />
			<div className="flex-1 p-4">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Skeleton className="h-32 w-full rounded-2xl" />
					<Skeleton className="h-32 w-full rounded-2xl" />
					<Skeleton className="h-40 w-full rounded-2xl md:col-span-2" />
				</div>
			</div>
		</div>
	);
}
