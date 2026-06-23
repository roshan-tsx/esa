import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export const handleDodoWebhook = httpAction(async (ctx, request) => {
	const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
	if (!webhookSecret) {
		return new Response("Webhook secret not configured", { status: 500 });
	}

	const signature = request.headers.get("webhook-signature");
	const body = await request.text();

	if (!signature) {
		return new Response("Missing signature", { status: 400 });
	}

	const isValid = await verifyWebhookSignature(body, signature, webhookSecret);
	if (!isValid) {
		return new Response("Invalid signature", { status: 401 });
	}

	const event = JSON.parse(body) as {
		type?: string;
		data?: {
			subscription_id?: string;
			status?: string;
			customer?: { email?: string };
			current_period_end?: number;
			metadata?: { userId?: string };
		};
	};

	const eventType = event.type ?? "";
	const data = event.data ?? {};

	if (
		eventType.includes("subscription.active") ||
		eventType.includes("subscription.created") ||
		eventType.includes("payment.succeeded")
	) {
		let userId: Id<"users"> | undefined = data.metadata?.userId as
			| Id<"users">
			| undefined;

		if (!userId && data.customer?.email) {
			const user = await ctx.runQuery(internal.billing.getUserByEmail, {
				email: data.customer.email,
			});
			userId = user?._id;
		}

		if (userId && data.subscription_id) {
			await ctx.runMutation(internal.billing.activatePro, {
				userId,
				providerSubscriptionId: data.subscription_id,
				status: "active",
				currentPeriodEnd: data.current_period_end,
			});
		}
	}

	if (
		eventType.includes("subscription.cancelled") ||
		eventType.includes("subscription.expired")
	) {
		if (data.subscription_id) {
			const subscriptionId = data.subscription_id;
			let userId: Id<"users"> | undefined = data.metadata?.userId as
				| Id<"users">
				| undefined;

			if (!userId && data.customer?.email) {
				const user = await ctx.runQuery(internal.billing.getUserByEmail, {
					email: data.customer.email,
				});
				userId = user?._id;
			}

			if (userId) {
				await ctx.runMutation(internal.billing.activatePro, {
					userId,
					providerSubscriptionId: subscriptionId,
					status: "cancelled",
				});
			}
		}
	}

	return new Response("ok", { status: 200 });
});

async function verifyWebhookSignature(
	body: string,
	signature: string,
	secret: string,
): Promise<boolean> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
	const expected = Array.from(new Uint8Array(mac))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return signature === expected || signature.endsWith(expected);
}
