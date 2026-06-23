import { GitPullRequestArrow } from "lucide-react";
import { EmailAuthForm } from "~/features/auth/ui/EmailAuthForm";
import { GoogleButton } from "~/features/auth/ui/GoogleButton";

export function LandingPage() {
	return (
		<div className="min-h-screen flex bg-background items-center text-foreground p-10 justify-around gap-10">
			<section className="flex justify-center border-r pr-10">
				<GitPullRequestArrow
					className="size-32 text-primary sm:size-40"
					strokeWidth={2}
				/>
			</section>

			<section className="flex w-full max-w-md flex-1 flex-col gap-8">
				<h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
					The Fast Lane For Founders
				</h1>
				<div className="flex flex-col gap-4">
					<GoogleButton />
					<div className="relative text-center text-sm text-muted-foreground">
						<span className="bg-background px-2 relative z-10">or</span>
						<div className="absolute inset-x-0 top-1/2 border-t" />
					</div>
					<EmailAuthForm />
				</div>
			</section>
		</div>
	);
}
