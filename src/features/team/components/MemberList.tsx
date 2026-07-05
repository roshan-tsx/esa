import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

type Member = {
	_id: string;
	role: string;
	user: { name: string | null; email: string | null };
};

type MemberListProps = {
	readonly members: Member[];
};

export function MemberList({ members }: MemberListProps) {
	return (
		<ul className="space-y-2">
			{members.map((member) => (
				<li key={member._id}>
					<Card className="gap-0 py-0 shadow-none">
						<CardContent className="flex items-center justify-between gap-3 p-4">
							<div className="min-w-0">
								<p className="truncate font-medium">
									{member.user.name ?? member.user.email ?? "Member"}
								</p>
								<p className="truncate text-sm text-muted-foreground">
									{member.user.email}
								</p>
							</div>
							<Badge variant="secondary" className="shrink-0">
								{member.role}
							</Badge>
						</CardContent>
					</Card>
				</li>
			))}
		</ul>
	);
}
