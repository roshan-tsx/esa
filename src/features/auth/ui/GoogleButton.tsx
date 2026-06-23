import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

export function GoogleButton() {
	const { signIn } = useAuthActions();
	const navigate = useNavigate();
	const [isPending, setIsPending] = useState(false);

	async function handleGoogleSignIn() {
		setIsPending(true);
		try {
			const result = await signIn("google", {
				redirectTo: `${window.location.origin}/app/dashboard`,
			});

			if (result.redirect) {
				return;
			}

			if (result.signingIn) {
				await navigate({ to: "/app/dashboard" });
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Google sign-in failed";

			if (
				message.includes("clientId") ||
				message.includes("clientSecret") ||
				message.includes("configuration")
			) {
				toast.error(
					"Google sign-in is not configured. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in your Convex deployment.",
				);
				return;
			}

			toast.error(message);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Button
			variant="secondary"
			className="w-full rounded-full gap-2 items-center justify-center"
			type="button"
			disabled={isPending}
			onClick={handleGoogleSignIn}
		>
			<FaGoogle className="size-4" />
			{isPending ? "Signing in..." : "Sign in with Google"}
		</Button>
	);
}
