import { z } from "zod";

export const buyProPlanResponseSchema = z.object({
	checkout_url: z.url(),
});

export type BuyProPlanResponse = z.infer<typeof buyProPlanResponseSchema>;
