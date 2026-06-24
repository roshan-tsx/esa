import { createFileRoute } from "@tanstack/react-router";
import { CreateSprintPage } from "~/features/sprints/ui/SprintsPage";

export const Route = createFileRoute("/app/sprints/new")({
	component: CreateSprintPage,
});
