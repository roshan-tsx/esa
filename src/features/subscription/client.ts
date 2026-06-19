import { mutationOptions } from "@tanstack/react-query";
import { buyProPlan } from "~/features/subscription/server";

export const buyProPlanMutation = () =>
	mutationOptions({
		mutationFn: buyProPlan,
	});
