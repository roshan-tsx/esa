/// <reference types="vite/client" />
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { GlobalSpinner } from "~/components/globals/GlobalSpinner";
import { AppProviders } from "~/features/auth/providers/AppProviders";
import { Toaster } from "~/components/ui/sonner";
import appCss from "~/styles/globals.css?url";

function headTags() {
	return {
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Engin - The Fast Lane For Founders",
			},
			{
				name: "description",
				content: "",
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Engin",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon-96x96.png",
				sizes: "96x96",
			},
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
			{ rel: "shortcut icon", href: "/favicon.ico" },
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{ rel: "manifest", href: "/site.webmanifest" },
		],
	};
}
function RootComponent() {
	return (
		<AppProviders>
			<RootDocument>
				<Outlet />
			</RootDocument>
		</AppProviders>
	);
}

function RootDocument({ children }: { readonly children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Toaster richColors />
				<Scripts />
			</body>
		</html>
	);
}
export const Route = createRootRoute({
	head: headTags,
	component: RootComponent,
	pendingComponent: GlobalSpinner,
});
