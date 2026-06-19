import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { createStartup } from "~/features/startup/server";

export const startupFormSchema = z.object({
	name: z.string().min(2).max(100),
	description: z.string().max(500),
	cin: z.string().min(10).max(15),
	industry: z.string().max(100),
});

export function StartupForm() {
	const { qc } = useRouteContext({ from: "/app" });

	const { mutate, isPending } = useMutation({
		mutationFn: createStartup,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["my-startups"] });
		},
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(startupFormSchema),
	});

	return (
		<form
			className="flex flex-1 w-full max-w-2xl flex-col gap-4 bg-card shadow-lg border border-accent shadow-accent rounded-xl justify-center p-6"
			onSubmit={handleSubmit((data) =>
				mutate({
					data: {
						name: data.name,
						description: data.description,
						industry: data.industry,
					},
				}),
			)}
		>
			<p className="text-2xl text-shadow-2xs text-shadow-accent text-primary font-bold">
				Add Your Startup
			</p>
			<Field>
				<FieldLabel>Name</FieldLabel>
				<Input
					{...register("name")}
					placeholder="What is your startup's name?"
				/>
				<FieldError>{errors.name?.message}</FieldError>
			</Field>
			<Field>
				<FieldLabel>Description</FieldLabel>
				<Input
					{...register("description")}
					placeholder="Describe your startup"
				/>
				<FieldError>{errors.description?.message}</FieldError>
			</Field>
			<Field>
				<FieldLabel>Industry</FieldLabel>
				<Input {...register("industry")} placeholder="" />
				<FieldError>{errors.industry?.message}</FieldError>
			</Field>
			<div className="flex gap-2  justify-end">
				<Button type="submit" variant={"default"} disabled={isPending}>
					<PlusIcon className="mr-2 h-4 w-4" />
					{isPending ? "Creating..." : "Create Startup"}
				</Button>
			</div>
		</form>
	);
}
