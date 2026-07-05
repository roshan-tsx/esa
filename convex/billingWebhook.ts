import { httpAction } from "./_generated/server";

// Dummy billing backend — replace with Dodo Payments integration later.
// Real implementation preserved in git history.

export const handleDodoWebhook = httpAction(async () => {
	return new Response("Billing is not configured yet", { status: 503 });
});
