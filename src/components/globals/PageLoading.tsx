export function PageLoading({ rows = 1 }: { rows?: number }) {
	return (
		<div className="flex flex-col gap-2">
			{Array.from({ length: rows }).map(() => (
				<div
					key={crypto.randomUUID()}
					className="h-4 w-full animate-pulse bg-muted"
				/>
			))}
		</div>
	);
}
