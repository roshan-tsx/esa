import { createFileRoute } from "@tanstack/react-router";
import { Webhooks } from "@dodopayments/tanstack";
import { env } from "~/env/server";
import { setSubscriptionStatusByEmail } from "~/features/subscription/server";

export const Route = createFileRoute("/api/dodo/webhooks")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				await Webhooks({
					webhookKey: env.DODO_PAYMENTS_WEBHOOK_SECRET,

					onSubscriptionRenewed: async ({ data }) => {
						const {
							customer: { email },
						} = data;
						await setSubscriptionStatusByEmail({
							email,
							userType: "pro",
							subscriptionStatus: "active",
						});
						console.log("Subscription Renewed for Customer:", email);
					},
					onSubscriptionActive: async ({ data }) => {
						const {
							customer: { email },
						} = data;
						await setSubscriptionStatusByEmail({
							email,
							userType: "pro",
							subscriptionStatus: "active",
						});
						console.log("Subscription Activated for Customer:", email);
					},
					onSubscriptionPaused: async ({ data }) => {
						const {
							customer: { email },
						} = data;
						await setSubscriptionStatusByEmail({
							email,
							userType: "basic",
							subscriptionStatus: "on_hold",
						});
						console.log("Subscription Paused for Customer:", email);
					},
					onSubscriptionOnHold: async ({ data }) => {
						const {
							customer: { email },
						} = data;
						await setSubscriptionStatusByEmail({
							email,
							userType: "basic",
							subscriptionStatus: "on_hold",
						});
						console.log("Subscription On Hold for Customer:", email);
					},

					onSubscriptionFailed: async ({ data }) => {
						const {
							customer: { email },
						} = data;
						await setSubscriptionStatusByEmail({
							email,
							userType: "basic",
							subscriptionStatus: "inactive",
						});
						console.log("Subscription Failed for Customer:", email);
					},
					onSubscriptionExpired: async ({ data }) => {
						const {
							customer: { email },
						} = data;
						await setSubscriptionStatusByEmail({
							email,
							userType: "basic",
							subscriptionStatus: "inactive",
						});
						console.log("Subscription Expired for Customer:", email);
					},
					onSubscriptionCancelled: async ({ data }) => {
						const {
							customer: { email },
						} = data;
						await setSubscriptionStatusByEmail({
							email,
							userType: "basic",
							subscriptionStatus: "inactive",
						});
						console.log("Subscription Cancelled for Customer:", email);
					},

					onPayload: async ({ data, type }) => {
						console.log("Received Dodo Webhook:", type, data);
					},
				})(request);
				return new Response(null, { status: 200 });
			},
		},
	},
});
