import { Link } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { useWorkspace } from "~/features/app/hooks/useWorkspace";
import type { Id } from "@convex/_generated/dataModel";

export function StartupSwitcher() {
	const { active, startups, isLoading, setActiveStartup } = useWorkspace();

	if (isLoading) {
		return (
			<div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
		);
	}

	if (startups.length === 0) {
		return (
			<Button asChild variant="outline" size="sm" className="inline-flex">
				<Link to="/app/startups/new">
					<Plus className="size-3.5" />
					Create startup
				</Link>
			</Button>
		);
	}

	const activeId = active?.startup._id;

	function handleSelect(startupId: Id<"startups">) {
		if (startupId !== activeId) {
			void setActiveStartup(startupId);
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="max-w-[9rem] gap-1.5 sm:max-w-[11rem] inline-flex"
				>
					<span className="truncate">{active?.startup.name ?? "Select startup"}</span>
					<ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-56">
				{startups.map(({ startup, role }) => (
					<DropdownMenuItem
						key={startup._id}
						className="flex cursor-pointer items-center justify-between gap-2"
						onClick={() => handleSelect(startup._id)}
					>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium">{startup.name}</p>
							<Badge variant="secondary" className="mt-0.5 text-[10px]">
								{role}
							</Badge>
						</div>
						<Check
							className={cn(
								"size-4 shrink-0",
								startup._id === activeId ? "opacity-100" : "opacity-0",
							)}
						/>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to="/app/startups/new" className="cursor-pointer">
						<Plus className="size-4" />
						Create startup
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
