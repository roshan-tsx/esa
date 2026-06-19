import { createFileRoute } from "@tanstack/react-router";
import { getBetterAuth } from "~/features/auth/lib";

const auth = getBetterAuth();

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => {
				return auth.handler(request);
			},
			POST: ({ request }) => {
				return auth.handler(request);
			},
		},
	},
});
