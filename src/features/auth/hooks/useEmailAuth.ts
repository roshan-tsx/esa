import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

type AuthMode = "signIn" | "signUp";

export function useEmailAuth() {
	const { signIn } = useAuthActions();
	const navigate = useNavigate();
	const ensureProfile = useMutation(api.users.ensureProfile);
	const [mode, setMode] = useState<AuthMode>("signIn");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [isPending, setIsPending] = useState(false);

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		setIsPending(true);

		try {
			const formData = new FormData();
			formData.set("email", email);
			formData.set("password", password);
			formData.set("flow", mode);
			if (mode === "signUp" && name) {
				formData.set("name", name);
			}

			await signIn("password", formData);
			await ensureProfile();
			toast.success(mode === "signUp" ? "Account created" : "Signed in");
			await navigate({ to: "/app/dashboard" });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Auth failed";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	}

	return {
		mode,
		setMode,
		email,
		setEmail,
		password,
		setPassword,
		name,
		setName,
		isPending,
		submit,
	};
}
