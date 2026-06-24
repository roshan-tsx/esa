import { Skeleton } from "~/components/ui/skeleton";

export function PageLoading({ rows = 4 }: { readonly rows?: number }) {
	return (
		<div className="space-y-4 p-8">
			<Skeleton className="h-8 w-48 rounded-full" />
			<Skeleton className="h-4 w-72" />
			<div className="space-y-3 pt-4">
				{Array.from({ length: rows }, (_, i) => (
					<Skeleton key={i} className="h-16 w-full rounded-xl" />
				))}
			</div>
		</div>
	);
}
