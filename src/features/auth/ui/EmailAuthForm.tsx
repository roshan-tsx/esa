import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useEmailAuth } from "~/features/auth/hooks/useEmailAuth";

export function EmailAuthForm() {
	const {
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
	} = useEmailAuth();

	return (
		<form onSubmit={submit} className="flex flex-col gap-4">
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
						onChange={(event) => setName(event.target.value)}
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
					onChange={(event) => setEmail(event.target.value)}
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
					onChange={(event) => setPassword(event.target.value)}
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
