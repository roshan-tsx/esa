import DodoPayments from "dodopayments";
import { eq } from "drizzle-orm";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { env } from "~/env/server";
import { db, profileTable } from "~/db";
import { authMiddleware } from "~/features/auth/server";

const getDodo = createServerOnlyFn(() => {
	return new DodoPayments({
		bearerToken: env.DODO_PAYMENTS_API_KEY,
		environment: env.DODO_ENVIRONMENT,
	});
});

export const buyProPlan = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const { user } = context;
		const dodo = getDodo();
		const { customer_id } = await dodo.customers.create({
			email: user.email,
			name: user.name,
		});
		const { checkout_url } = await dodo.checkoutSessions.create({
			product_cart: [{ product_id: env.DODO_PRO_PLAN_ID, quantity: 1 }],
			subscription_data: {
				trial_period_days: 7,
			},
			customer: { customer_id },
			return_url: `${env.BASE_URL}/app/settings/billing/pro`,
		});
		if (!checkout_url) {
			throw new Response("Payment Failed Try Again Later", { status: 500 });
		}
		return { checkout_url };
	});

export async function setSubscriptionStatusByEmail(input: {
	email: string;
	userType: "basic" | "pro";
	subscriptionStatus: "active" | "on_hold" | "inactive";
}) {
	await db
		.update(profileTable)
		.set({
			user_type: input.userType,
			subscription_status: input.subscriptionStatus,
		})
		.where(eq(profileTable.email, input.email));
}
