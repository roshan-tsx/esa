import { createFileRoute } from "@tanstack/react-router";
import { getBetterAuth } from "~/features/auth/server/fn";

const auth = getBetterAuth();

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => auth.handler(request),
			POST: ({ request }) => auth.handler(request),
		},
	},
});
