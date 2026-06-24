import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

export function GoogleButton() {
	const { signIn } = useAuthActions();
	const navigate = useNavigate();
	const ensureProfile = useMutation(api.users.ensureProfile);
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
				await ensureProfile();
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
		<button
			type="button"
			disabled={isPending}
			onClick={handleGoogleSignIn}
			className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-[#dadce0] bg-white px-4 text-sm font-medium text-[#3c4043] shadow-sm transition-colors hover:bg-[#f8f9fa] disabled:opacity-60"
		>
			<FaGoogle className="size-4" />
			{isPending ? "Signing in..." : "Sign in with Google"}
		</button>
	);
}
