import { GoogleButton } from "~/features/auth/GoogleButton";

export function LandingPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-6 py-10 md:grid-cols-2 md:px-10">
				<section className="space-y-6">
					<p className="text-sm font-medium tracking-wide text-primary">
						ENGIN
					</p>
					<h1 className="text-4xl font-bold leading-tight md:text-6xl">
						Happening now for founders
					</h1>
					<p className="max-w-md text-base text-muted-foreground md:text-lg">
						Build startups, connect with builders, and move from idea to launch
						in one focused workspace.
					</p>
				</section>

				<section className="w-full max-w-sm justify-self-start rounded-2xl border bg-card/40 p-6 backdrop-blur md:justify-self-end">
					<div className="space-y-4">
						<h2 className="text-2xl font-semibold">Join ENGIN today</h2>
						<p className="text-sm text-muted-foreground">
							Sign in with Google to create your account and set up your
							founder profile in under a minute.
						</p>
					</div>

					<div className="mt-6">
						<GoogleButton className="w-full" />
					</div>
				</section>
			</div>
		</div>
	);
}
