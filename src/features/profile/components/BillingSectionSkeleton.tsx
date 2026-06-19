import { Skeleton } from "~/components/ui/skeleton";

export function BillingSectionSkeleton() {
	return (
		<div className="flex-1 flex flex-col">
			<div className="flex justify-start gap-2 py-2">
				<Skeleton className="h-10 w-40" />
			</div>
			<div className="flex-1 flex items-center justify-center gap-6 p-4">
				<Skeleton className="h-8 w-56" />
				<Skeleton className="h-10 w-28" />
			</div>
		</div>
	);
}
