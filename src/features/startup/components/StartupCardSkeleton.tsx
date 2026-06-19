import { Skeleton } from "~/components/ui/skeleton";

export function StartupCardSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center bg-card h-full rounded-2xl p-4 gap-2">
			<Skeleton className="h-6 w-40" />
			<Skeleton className="h-4 w-28" />
			<Skeleton className="h-4 w-52" />
			<Skeleton className="h-3 w-44" />
			<Skeleton className="h-3 w-44" />
		</div>
	);
}
