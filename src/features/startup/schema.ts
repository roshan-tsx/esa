import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profileTable } from "~/features/profile/schema";

export const startupTable = pgTable("startup", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	verified: text("verified").notNull().default("pending"),
	description: text("description"),
	cin: text("cin").unique(),
	industry: text("industry"),
	owner_id: text("owner_id")
		.notNull()
		.references(() => profileTable.id, { onDelete: "cascade" }),
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
});
