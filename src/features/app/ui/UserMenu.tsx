import { useAuthActions } from "@convex-dev/auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { initials } from "~/lib/initials";

type UserMenuProps = {
	readonly name: string;
	readonly email: string | null;
	readonly image: string | null;
};

function firstName(name: string) {
	return name.trim().split(/\s+/)[0] ?? name;
}

export function UserMenu({ name, email, image }: UserMenuProps) {
	const { signOut } = useAuthActions();
	const displayName = firstName(name);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="group h-8 gap-0 overflow-hidden rounded-full p-0.5 pr-0.5 transition-[padding,background-color] duration-300 hover:bg-muted/60 hover:pr-2.5 data-[state=open]:bg-muted/60 data-[state=open]:pr-2.5"
					aria-label={displayName}
				>
					<Avatar className="size-7">
						{image ? <AvatarImage src={image} alt={displayName} /> : null}
						<AvatarFallback className="text-xs">
							{initials(name, email)}
						</AvatarFallback>
					</Avatar>
					<span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:ml-1.5 group-hover:max-w-28 group-hover:opacity-100 group-data-[state=open]:ml-1.5 group-data-[state=open]:max-w-28 group-data-[state=open]:opacity-100">
						{displayName}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				<DropdownMenuItem
					className="cursor-pointer"
					onClick={() => void signOut()}
				>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
