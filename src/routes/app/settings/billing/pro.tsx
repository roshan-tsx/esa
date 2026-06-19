import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { buyProPlan } from "~/features/subscription/server";

export const Route = createFileRoute("/app/settings/billing/pro")({
	component: RouteComponent,
});

export function RouteComponent() {
	const router = useRouter();
	const { isPending, mutate } = useMutation({
		mutationFn: buyProPlan,
		onSuccess: ({ checkout_url }) => {
			router.navigate({ href: checkout_url });
		},
		onError: () => {
			toast.error("Failed to initiate purchase. Please try again later.");
		},
	});

	return (
		<div className="p-4 flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-4">Upgrade to Pro</h1>
				<p className="text-muted-foreground mb-6">
					a generic table to show basic vs pro features.
				</p>
				<Button onClick={() => mutate({})} disabled={isPending}>
					{isPending ? "Applying..." : "Buy Pro Plan"}
				</Button>
			</div>
		</div>
	);
}
