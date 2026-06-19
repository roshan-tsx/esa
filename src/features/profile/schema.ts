import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "~/features/auth/schema";

export const profileTable = pgTable("profile", {
	id: text("id")
		.notNull()
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	username: text("username").notNull().unique(),
	full_name: text("full_name").notNull(),
	email: text("email").notNull(),
	user_type: text("user_type").default("basic").notNull(),
	subscription_status: text("subscription_status")
		.default("inactive")
		.notNull(),
	dodo_customer_id: text("dodo_customer_id"),
	avatar_url: text("avatar_url"),
	city: text("city"),
	state: text("state"),
	country: text("country"),
	preferred_work_type: text("preferred_work_type"),
	preferred_domain: text("preferred_domain"),
	experience_level: text("experience_level"),
	bio: text("bio"),
	streak_count: integer("streak_count").default(0),
	kyc_status: boolean("kyc_status").default(false).notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
