import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "@convex/_generated/api";

export function EmailAuthForm() {
	const { signIn } = useAuthActions();
	const navigate = useNavigate();
	const ensureProfile = useMutation(api.users.ensureProfile);
	const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
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

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex gap-2">
				<Button
					type="button"
					variant={mode === "signIn" ? "default" : "outline"}
					className="flex-1"
					onClick={() => setMode("signIn")}
				>
					Sign in
				</Button>
				<Button
					type="button"
					variant={mode === "signUp" ? "default" : "outline"}
					className="flex-1"
					onClick={() => setMode("signUp")}
				>
					Sign up
				</Button>
			</div>

			{mode === "signUp" && (
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Your name"
					/>
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@company.com"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					required
					minLength={8}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="At least 8 characters"
				/>
			</div>

			<Button type="submit" className="w-full rounded-full" disabled={isPending}>
				{isPending
					? "Please wait..."
					: mode === "signUp"
						? "Create account"
						: "Sign in with email"}
			</Button>
		</form>
	);
}
