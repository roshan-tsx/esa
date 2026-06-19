import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { profileQueryOptions } from "~/features/profile/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BillingSectionSkeleton } from "~/features/profile/components/BillingSectionSkeleton";

export const Route = createFileRoute("/app/settings/billing/")({
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const { data: profile, isLoading, isFetching } = useQuery({
		...profileQueryOptions(),
		placeholderData: keepPreviousData,
	});
	if (isLoading) {
		return <BillingSectionSkeleton />;
	}
	return (
		<div className="flex-1 flex flex-col">
			{isFetching ? <div className="h-0.5 w-full bg-primary/40 animate-pulse" /> : null}
			<div className="flex justify-start gap-2 py-2">
				<Button
					variant={"ghost"}
					onClick={() => router.navigate({ to: "/app/settings" })}
				>
					<ArrowLeft />
					<p className="text-xl text-muted-foreground ">Billing</p>
				</Button>
			</div>
			<div className="flex-1 flex  items-center justify-center gap-6 p-4">
				{profile?.user_type === "pro" ? (
					<p className="text-lg font-medium">You are in pro plan.</p>
				) : (
					<div>You are in free plan</div>
				)}
				<Button asChild variant={"outline"}>
					<Link to="/app/settings/billing/pro">Buy Pro</Link>
				</Button>
			</div>
		</div>
	);
}
