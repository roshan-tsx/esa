import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { GlobalError } from "./components/globals/GlobalError";
import { GlobalNotFound } from "./components/globals/GlobalNotFound";

export function getRouter() {
	return createRouter({
		routeTree,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultErrorComponent: GlobalError,
		defaultNotFoundComponent: GlobalNotFound,
		scrollRestoration: true,
		defaultStructuralSharing: true,
	});
}
