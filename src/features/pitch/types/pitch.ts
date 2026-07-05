export const pitchSections = [
	{ key: "pitchProblem", label: "Problem", placeholder: "What problem are you solving?" },
	{ key: "pitchSolution", label: "Solution", placeholder: "How does your product solve it?" },
	{ key: "pitchMarket", label: "Market", placeholder: "Who is your target market?" },
	{ key: "pitchTraction", label: "Traction", placeholder: "Metrics, milestones, early wins" },
	{ key: "pitchTeam", label: "Team", placeholder: "Who is building this?" },
] as const;

export type PitchSectionKey = (typeof pitchSections)[number]["key"];

export type PitchFormState = {
	tagline: string;
	description: string;
	website: string;
	pitchProblem: string;
	pitchSolution: string;
	pitchMarket: string;
	pitchTraction: string;
	pitchTeam: string;
};
