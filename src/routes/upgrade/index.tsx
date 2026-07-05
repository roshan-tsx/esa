import { createFileRoute } from "@tanstack/react-router";
import { PricingPage } from "~/features/billing/ui/PricingPage";

export const Route = createFileRoute("/upgrade/")({
	component: PricingPage,
});
