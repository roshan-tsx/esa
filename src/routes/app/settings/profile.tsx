import { Button } from "~/components/ui/button";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { profileQueryOptions } from "~/features/profile/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { updateMyProfile } from "~/features/profile/server";
import { ProfileSettingsSkeleton } from "~/features/profile/components/ProfileSettingsSkeleton";
import z from "zod";

const ProfileSchema = z.object({
	full_name: z
		.string()
		.trim()
		.min(4, "Full name must be at least 4 characters")
		.max(100, "Full name is too long")
		.regex(
			/^[A-Za-z]+(?: [A-Za-z]+)*$/,
			"Full name can only contain letters and single spaces, and must start with a letter",
		),
});

export const Route = createFileRoute("/app/settings/profile")({
	component: RouteComponent,
});

function RouteComponent() {
	const { qc } = Route.useRouteContext();
	const router = useRouter();
	const { data: profile, isLoading, isFetching } = useQuery({
		...profileQueryOptions(),
		placeholderData: keepPreviousData,
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			full_name: profile?.full_name ?? "",
		},
		resolver: zodResolver(ProfileSchema),
	});
	const { mutate, isPending } = useMutation({
		mutationFn: updateMyProfile,
		onMutate: async ({ data }) => {
			await qc.cancelQueries({ queryKey: profileQueryOptions().queryKey });
			const previousProfile = qc.getQueryData(profileQueryOptions().queryKey);
			qc.setQueryData(
				profileQueryOptions().queryKey,
				(oldProfile: typeof profile | null | undefined) =>
				oldProfile ? { ...oldProfile, ...data } : oldProfile,
			);
			return { previousProfile };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousProfile) {
				qc.setQueryData(profileQueryOptions().queryKey, context.previousProfile);
			}
			toast.error("Error occurred while updating");
		},
		onSuccess: async () => {
			qc.invalidateQueries(profileQueryOptions());
			toast.success("Profile updated successfully");
		},
	});

	if (isLoading) {
		return <ProfileSettingsSkeleton />;
	}

	if (!profile) {
		return null;
	}

	return (
		<div className="flex-1 flex-col flex">
			{isFetching ? <div className="h-0.5 w-full bg-primary/40 animate-pulse" /> : null}
			<div className="flex justify-start gap-2 py-2">
				<Button
					variant={"ghost"}
					onClick={() => router.navigate({ to: "/app/settings" })}
				>
					<ArrowLeft />
					<p className="text-xl text-muted-foreground ">Profile Settings</p>
				</Button>
			</div>
			<div className="flex-1 flex gap-2 ">
				<div className="md:flex items-center hidden justify-center w-1/2">
					<img
						className="w-full max-w-md"
						src="/illustrations/undraw_personal-information_h7kf.svg"
						alt="Profile Illustration"
					/>
				</div>
				<form
					className="flex bg-card/30 md:w-1/2 w-full flex-col justify-between rounded-xl gap-4 p-2"
					id="edit-profile-form"
					onSubmit={handleSubmit((data) =>
						mutate({
							data: data,
						}),
					)}
				>
					<div className="flex md:flex-row flex-col gap-6 items-center justify-center p-2">
						<Field className="cursor-not-allowed">
							<Label className="text-base" htmlFor="username">
								Username
								<LockIcon className="w-4 h-4" />
							</Label>
							<Input
								className="w-full max-w-md"
								id="username"
								value={profile.username}
								disabled={true}
							/>
						</Field>
						<Field data-invalid={!errors}>
							<FieldLabel htmlFor="full_name">Full Name</FieldLabel>
							<Input
								className="w-full max-w-md"
								id="full_name"
								{...register("full_name")}
							/>
							<FieldError>{errors.full_name?.message}</FieldError>
						</Field>
					</div>

					<div className="flex justify-end">
						<Button
							className="text-base  p-4"
							type="submit"
							form="edit-profile-form"
						>
							{isPending ? <Spinner /> : null}
							{isPending ? "Updating" : "Update Profile"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
