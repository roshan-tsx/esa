import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ArrowDownUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { authClient, type Session } from "~/features/auth/client";
import { profileQueryOptions } from "~/features/profile/client";
import { createMyProfile } from "~/features/profile/server";

const schema = z.object({
	full_name: z
		.string()
		.trim()
		.min(4, "Full name must be at least 4 characters")
		.max(100, "Full name is too long")
		.regex(
			/^[A-Za-z]+(?: [A-Za-z]+)*$/,
			"Full name can only contain letters and single spaces",
		),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(30, "Username must be at most 30 characters")
		.regex(/^[a-z][a-z0-9_]*$/, "Username must start with a letter")
		.transform((v) => v.toLowerCase()),
});

export function Onboarding({ user }: { user: Session["user"] }) {
	const qc = useQueryClient();
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: createMyProfile,
		onSuccess: async () => {
			toast.success("Profile created");
			await qc.invalidateQueries(profileQueryOptions());
			await router.invalidate();
		},
		onError: (err) => toast.error(err.message),
	});

	const { register, handleSubmit, formState: { errors } } = useForm({
		resolver: zodResolver(schema),
		defaultValues: { full_name: user.name, username: "" },
	});

	return (
		<div className="flex items-center justify-center min-h-screen gap-12 p-6">
			<img
				className="w-full md:w-1/3 object-contain"
				src="/illustrations/undraw_all-the-data_ijgn.svg"
				alt=""
			/>
			<div className="flex bg-card rounded-xl flex-col gap-4 p-6 w-full max-w-md">
				<p className="text-xl">
					Hey, <span className="text-primary">{user.name}!</span>
				</p>
				<Button
					variant="link"
					className="justify-start text-muted-foreground p-0 h-auto"
					onClick={async () => {
						await authClient.signOut();
						await qc.invalidateQueries({ queryKey: ["auth"] });
						await router.navigate({ to: "/", replace: true });
					}}
				>
					<ArrowDownUp className="h-4 w-4" />
					Switch ({user.email})
				</Button>
				<form
					className="flex flex-col gap-4"
					onSubmit={handleSubmit((data) => mutate({ data }))}
				>
					<Field data-invalid={!!errors.full_name}>
						<FieldLabel htmlFor="full_name">Full name</FieldLabel>
						<Input id="full_name" {...register("full_name")} />
						<FieldError>{errors.full_name?.message}</FieldError>
					</Field>
					<Field data-invalid={!!errors.username}>
						<FieldLabel htmlFor="username">Username</FieldLabel>
						<Input id="username" {...register("username")} />
						<FieldError>{errors.username?.message}</FieldError>
					</Field>
					<Button type="submit" disabled={isPending} className="w-full">
						{isPending && <Spinner />}
						Continue
					</Button>
				</form>
			</div>
		</div>
	);
}
