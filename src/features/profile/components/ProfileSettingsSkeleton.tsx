import { Skeleton } from "~/components/ui/skeleton";

export function ProfileSettingsSkeleton() {
	return (
		<div className="flex-1 flex-col flex">
			<div className="flex justify-start gap-2 py-2">
				<Skeleton className="h-10 w-56" />
			</div>
			<div className="flex-1 flex gap-2">
				<div className="md:flex items-center hidden justify-center w-1/2">
					<Skeleton className="w-full max-w-md h-80" />
				</div>
				<div className="flex bg-card/30 md:w-1/2 w-full flex-col justify-between rounded-xl gap-4 p-2">
					<div className="flex md:flex-row flex-col gap-6 items-center justify-center p-2">
						<div className="w-full max-w-md space-y-2">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="w-full max-w-md space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
					<div className="flex justify-end">
						<Skeleton className="h-10 w-40" />
					</div>
				</div>
			</div>
		</div>
	);
}
