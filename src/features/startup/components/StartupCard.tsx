interface StartupCardProps {
	name: string;
	description: string;
	cin: string | null;
	created_at: Date;
	updated_at: Date;
}

export function StartupCard(props: StartupCardProps) {
	return (
		<div className="flex flex-col items-center justify-center bg-card h-full rounded-2xl">
			<p className="text-lg font-semibold">{props.name}</p>
			<p className="text-sm text-muted-foreground">{props.cin}</p>
			<p className="text-sm text-muted-foreground">{props.description}</p>
			<p className="text-xs text-muted-foreground">
				{props.created_at.toLocaleString()}
			</p>
			<p className="text-xs text-muted-foreground">
				{props.updated_at.toLocaleString()}
			</p>
		</div>
	);
}
