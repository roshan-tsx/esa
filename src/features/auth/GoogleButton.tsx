import { useMutation } from "@tanstack/react-query";
import { FaGoogle } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { authClient } from "~/features/auth/client";
import { cn } from "~/lib/utils";

export function GoogleButton({ className }: { className?: string }) {
	const { isPending, mutate } = useMutation({
		mutationFn: () =>
			authClient.signIn.social(
				{ provider: "google", callbackURL: "/app/dashboard" },
				{ onError: ({ error }) => { toast.error(error.message || "Sign-in failed"); } },
			),
	});

	return (
		<Button
			variant="outline"
			className={cn("w-fit", className)}
			type="button"
			disabled={isPending}
			onClick={() => mutate()}
		>
			<FaGoogle />
			Login with Google
		</Button>
	);
}
