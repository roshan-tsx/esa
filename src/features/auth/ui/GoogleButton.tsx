import { FaGoogle } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { useGoogleSignIn } from "~/features/auth/hooks/useGoogleSignIn";

type GoogleButtonProps = {
	readonly label?: string;
};

export function GoogleButton({ label = "Sign in with Google" }: GoogleButtonProps) {
	const { signInWithGoogle, isPending } = useGoogleSignIn();

	return (
		<Button
			type="button"
			variant="outline"
			size="lg"
			className="h-11 w-full rounded-lg"
			disabled={isPending}
			onClick={signInWithGoogle}
		>
			<FaGoogle className="size-4" />
			{isPending ? "Signing in..." : label}
		</Button>
	);
}
