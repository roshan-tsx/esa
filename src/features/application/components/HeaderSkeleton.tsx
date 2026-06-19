import { Skeleton } from "~/components/ui/skeleton";
import { AppAvatarSkeleton } from "./AppAvatarSkeleton";

export function HeaderSkeleton() {
	return (
		<div className="flex items-center justify-between px-4">
			<div className="flex items-center gap-2">
				<Skeleton className="h-5 w-5 rounded-full" />
				<Skeleton className="h-6 w-24" />
			</div>
			<div className="hidden md:flex items-center gap-3">
				<Skeleton className="h-10 w-28" />
				<Skeleton className="h-10 w-24" />
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="h-10 w-10 rounded-xl" />
				<Skeleton className="h-8 w-14 rounded-xl" />
				<AppAvatarSkeleton />
			</div>
		</div>
	);
}
