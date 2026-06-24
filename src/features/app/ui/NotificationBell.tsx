import { useMutation, useQuery } from "convex/react";
import { Bell, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export function NotificationBell() {
	const invites = useQuery(api.invitations.listMyPendingInvites);
	const acceptInvite = useMutation(api.invitations.acceptInviteById);
	const [acceptingId, setAcceptingId] = useState<Id<"invites"> | null>(null);

	const count = invites?.length ?? 0;

	async function handleAccept(inviteId: Id<"invites">) {
		setAcceptingId(inviteId);
		try {
			await acceptInvite({ inviteId });
			toast.success("Invite accepted — switched to that startup");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to accept invite";
			toast.error(message);
		} finally {
			setAcceptingId(null);
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="relative size-10 rounded-md"
					aria-label={
						count > 0
							? `${count} pending notification${count === 1 ? "" : "s"}`
							: "Notifications"
					}
				>
					<Bell className="size-4" />
					{count > 0 && (
						<span
							className="absolute -right-0.5 -top-0.5 flex size-2.5 rounded-full bg-red-500 ring-2 ring-background"
							aria-hidden
						/>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuLabel className="font-normal">
					<span className="font-medium">Notifications</span>
					{count > 0 && (
						<span className="ml-2 text-xs text-muted-foreground">
							{count} pending
						</span>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{invites === undefined ? (
					<p className="px-2 py-3 text-sm text-muted-foreground">Loading...</p>
				) : invites.length === 0 ? (
					<p className="px-2 py-3 text-sm text-muted-foreground">
						No notifications
					</p>
				) : (
					<ul className="max-h-72 overflow-y-auto">
						{invites.map((invite) => (
							<li
								key={invite._id}
								className="flex items-start gap-2 border-b border-border/60 px-2 py-3 last:border-0"
							>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium leading-snug">
										Join {invite.startupName}
									</p>
									<p className="mt-0.5 text-xs text-muted-foreground">
										{invite.inviterName} invited you as {invite.role}
									</p>
								</div>
								<Button
									type="button"
									size="icon-sm"
									className={cn(
										"shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
									)}
									disabled={acceptingId === invite._id}
									aria-label={`Accept invite to ${invite.startupName}`}
									onClick={() => handleAccept(invite._id)}
								>
									<Check className="size-4" />
								</Button>
							</li>
						))}
					</ul>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
