import { ConvexReactClient } from "convex/react";
import { env } from "~/env/client";

export const convex = new ConvexReactClient(env.VITE_CONVEX_URL);
