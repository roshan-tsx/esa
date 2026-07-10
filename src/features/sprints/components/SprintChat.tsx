import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Id } from "@convex/_generated/dataModel";

type SprintMessage = {
	_id: Id<"sprintMessages">;
	content: string;
	user: { name: string | null; email: string | null } | null;
};

type SprintChatProps = {
	readonly messages: SprintMessage[] | undefined;
	readonly message: string;
	readonly canChat: boolean;
	readonly isPending: boolean;
	readonly onMessageChange: (value: string) => void;
	readonly onSend: () => void;
};

export function SprintChat({
	messages,
	message,
	canChat,
	isPending,
	onMessageChange,
	onSend,
}: SprintChatProps) {
	return (
		<section className="flex flex-col rounded-lg border">
			<div className="border-b px-4 py-3">
				<h2 className="font-semibold">Sprint chat</h2>
				<p className="text-xs text-muted-foreground">
					{canChat
						? "Chat with candidates"
						: "Available when sprint is active"}
				</p>
			</div>
			<div className="min-h-72 flex-1 space-y-3 overflow-auto p-4">
				{messages === undefined ? (
					<p className="text-sm text-muted-foreground">Loading...</p>
				) : messages.length === 0 ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						No messages yet
					</p>
				) : (
					messages.map((msg) => (
						<div key={msg._id} className="rounded-lg bg-muted/50 px-3 py-2">
							<p className="text-xs font-medium">
								{msg.user?.name ?? msg.user?.email ?? "User"}
							</p>
							<p className="mt-0.5 text-sm">{msg.content}</p>
						</div>
					))
				)}
			</div>
			{canChat && (
				<form
					className="flex gap-2 border-t p-3"
					onSubmit={(event) => {
						event.preventDefault();
						if (!message.trim()) return;
						onSend();
					}}
				>
					<Input
						value={message}
						onChange={(event) => onMessageChange(event.target.value)}
						placeholder="Ask a question..."
						className="rounded-full"
					/>
					<Button type="submit" disabled={isPending}>
						Send
					</Button>
				</form>
			)}
		</section>
	);
}
