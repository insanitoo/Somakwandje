import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analyticsVisitsTable = pgTable(
  "analytics_visits",
  {
    id: serial("id").primaryKey(),
    visitedAt: timestamp("visited_at", { withTimezone: true }).notNull().defaultNow(),
    path: text("path").notNull(),
    countryCode: text("country_code"),
  },
  (table) => ({
    visitedAtIdx: index("analytics_visits_visited_at_idx").on(table.visitedAt),
    countryCodeIdx: index("analytics_visits_country_code_idx").on(table.countryCode),
  }),
);

export const insertAnalyticsVisitSchema = createInsertSchema(analyticsVisitsTable).omit({
  id: true,
  visitedAt: true,
});
export type InsertAnalyticsVisit = z.infer<typeof insertAnalyticsVisitSchema>;
export type AnalyticsVisit = typeof analyticsVisitsTable.$inferSelect;