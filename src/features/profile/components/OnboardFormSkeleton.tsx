import { Skeleton } from "~/components/ui/skeleton";

export function OnboardFormSkeleton() {
	return (
		<div className="flex bg-card rounded-xl flex-col gap-4 p-6 items-center justify-center w-full max-w-md">
			<header className="flex flex-col items-start w-full gap-2">
				<Skeleton className="h-7 w-44" />
				<Skeleton className="h-8 w-40" />
			</header>
			<div className="flex flex-1 flex-col w-full gap-4">
				<div className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10 w-full" />
				</div>
				<Skeleton className="h-10 w-full" />
			</div>
		</div>
	);
}
