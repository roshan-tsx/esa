import OnboardForm from "~/features/profile/components/OnboardForm";
import type { Me } from "~/features/auth/client";

type OnboardingScreenProps = {
	user: Me["user"];
};

export function OnboardingScreen({ user }: OnboardingScreenProps) {
	return (
		<div className="flex items-center justify-center ring min-h-screen gap-12 p-6">
			<img
				className="w-full md:w-1/3 object-contain"
				src="/illustrations/undraw_all-the-data_ijgn.svg"
				alt=""
			/>
			<OnboardForm user={user} />
		</div>
	);
}
