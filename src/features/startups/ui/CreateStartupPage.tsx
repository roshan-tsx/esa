import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "@convex/_generated/api";

export function CreateStartupPage() {
	const navigate = useNavigate();
	const createStartup = useMutation(api.startups.create);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [tagline, setTagline] = useState("");
	const [website, setWebsite] = useState("");
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setIsPending(true);

		try {
			await createStartup({
				name,
				description: description || undefined,
				tagline: tagline || undefined,
				website: website || undefined,
			});
			toast.success("Startup created");
			await navigate({ to: "/app/dashboard" });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to create startup";
			toast.error(message);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className="w-full max-w-2xl py-8 space-y-8">
			<div>
				<h1 className="text-2xl font-bold">Create your startup</h1>
				<p className="mt-1 text-muted-foreground">
					Add the basics now. Refine your pitch later.
				</p>
			</div>

			<Card className="shadow-none">
				<CardContent className="p-4 sm:p-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Startup name</Label>
							<Input
								id="name"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Acme Inc"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="tagline">Tagline</Label>
							<Input
								id="tagline"
								value={tagline}
								onChange={(e) => setTagline(e.target.value)}
								placeholder="One line pitch"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="What are you building?"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="website">Website</Label>
							<Input
								id="website"
								type="url"
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
								placeholder="https://"
							/>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row">
							<Button type="submit" disabled={isPending}>
								{isPending ? "Creating..." : "Create startup"}
							</Button>
							<Button asChild variant="outline">
								<Link to="/app/dashboard">Cancel</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
