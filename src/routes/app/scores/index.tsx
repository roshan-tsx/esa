import { createFileRoute } from "@tanstack/react-router";
import { ScoresPage } from "~/features/scores/ui/ScoresPage";

export const Route = createFileRoute("/app/scores/")({
	component: ScoresPage,
});
