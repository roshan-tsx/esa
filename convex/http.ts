import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handleDodoWebhook } from "./billingWebhook";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
	path: "/webhooks/dodo",
	method: "POST",
	handler: handleDodoWebhook,
});

export default http;
