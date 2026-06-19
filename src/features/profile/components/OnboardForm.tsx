import { ArrowDownUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { authClient, meQueryOptions } from "~/features/auth/client";
import { profileQueryOptions } from "~/features/profile/client";
import { Spinner } from "~/components/ui/spinner";
import { createMyProfile } from "~/features/profile/server";
import { useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import type { Me } from "~/features/auth/client";

const NameFormSchema = z.object({
	full_name: z
		.string()
		.trim()
		.min(4, "Full name must be at least 4 characters")
		.max(100, "Full name is too long")
		.regex(
			/^[A-Za-z]+(?: [A-Za-z]+)*$/,
			"Full name can only contain letters and single spaces, and must start with a letter",
		),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(30, "Username must be at most 30 characters")
		.regex(
			/^[a-z][a-z0-9_]*$/,
			"Username must start with a letter and contain no spaces",
		)
		.transform((v) => v.toLowerCase()),
});

type OnboardFormProps = {
	user: Me["user"];
};

export default function OnboardForm({ user }: OnboardFormProps) {
	const qc = useQueryClient();
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: createMyProfile,
		onSuccess: async () => {
			toast.success("Profile created");
			await qc.invalidateQueries(profileQueryOptions());
			await router.invalidate();
			await router.navigate({ to: "/app/dashboard" });
		},
		onError: (err) => {
			console.error(err);
			toast.error(err.message);
		},
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(NameFormSchema),
		mode: "onChange",
		defaultValues: {
			full_name: user.name,
			username: "",
		},
	});

	const handleSwitchAccount = async () => {
		try {
			toast.warning("Signing out...");
			await authClient.signOut();
			await qc.invalidateQueries({ queryKey: ["auth"] });
			await qc.invalidateQueries(profileQueryOptions());
			await router.navigate({ to: "/", replace: true });
		} catch (err) {
			console.error(err);
			toast.error("Failed to sign out");
		}
	};

	return (
		<div className="flex bg-card rounded-xl flex-col gap-4 p-6 items-center justify-center w-full max-w-md">
			<header className="flex flex-col items-start w-full">
				<p className="text-xl ">
					Heyy , <span className="text-primary">{user.name} !</span>
				</p>
				<Button
					variant="link"
					onClick={handleSwitchAccount}
					className="flex items-center justify-start text-muted-foreground"
				>
					<ArrowDownUp className="h-4 w-4" />
					Switch ({user.email})
				</Button>
			</header>
			<form
				className="flex flex-1 flex-col w-full gap-4"
				onSubmit={handleSubmit((data) =>
					mutate({
						data,
					}),
				)}
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
				<Button
					type="submit"
					variant="default"
					disabled={isPending}
					className="w-full"
				>
					{isPending && <Spinner />}
					Continue
				</Button>
			</form>
		</div>
	);
}
