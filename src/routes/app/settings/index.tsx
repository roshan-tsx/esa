import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, CreditCard, User } from "lucide-react";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/app/settings/")({
	component: RouteComponent,
});

function RouteComponent() {
	const nav = [
		{ name: "Profile", path: "/app/settings/profile", icon: User },
		{ name: "Billing", path: "/app/settings/billing", icon: CreditCard },
	];
   
	return (
		<div className="flex-1 flex-col flex">
			<p className="text-xl text-muted-foreground font-bold p-4">Settings</p>
			<div className="flex flex-col md:flex-row items-center justify-around gap-4">
				{nav.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.path}
							to={item.path}
							className={cn(
								"flex items-center justify-between p-4 rounded-xl",
								"w-full md:max-w-1/2 max-w-md tracking-wider bg-card",
								"hover:bg-accent hover:text-accent-foreground",
							)}
						>
							<div className="flex items-center gap-2 justify-center">
								<Icon className="h-5 w-5" />
								<span className="text-base">{item.name}</span>
							</div>
							<ArrowRightIcon />
						</Link>
					);
				})}
			</div>
		</div>
	);
}
