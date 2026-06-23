import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
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
		<div className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-8 p-10">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Create your startup</h1>
				<p className="text-muted-foreground">
					Add the basics now. You can refine your pitch later.
				</p>
			</div>

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

				<div className="flex gap-2">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Creating..." : "Create startup"}
					</Button>
					<Button asChild variant="outline">
						<Link to="/app/dashboard">Cancel</Link>
					</Button>
				</div>
			</form>
		</div>
	);
}
