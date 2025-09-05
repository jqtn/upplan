import {
  pgTable,
  uuid,
  smallint,
  text,
  timestamp,
  date,
  varchar,
  bigint,
  serial,
  boolean,
  json,
} from "drizzle-orm/pg-core";

export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  categoryId: smallint("category_id").notNull(),
  title: varchar("title").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const steps = pgTable("steps", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  roadmapId: uuid("roadmap_id")
    .notNull()
    .references(() => roadmaps.id),
  title: varchar("title").notNull(),
  note: text("note"),
  allGoalsRequired: boolean("all_goals_required").notNull().default(false),
  parentIds: json("parent_ids").$type<number[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stepGoals = pgTable("step_goals", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  roadmapId: uuid("roadmap_id")
    .notNull()
    .references(() => roadmaps.id),
  stepId: bigint("step_id", { mode: "number" })
    .notNull()
    .references(() => steps.id),
  title: varchar("title").notNull(),
  type: smallint("type").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stepGoalStates = pgTable("step_goal_states", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  roadmapId: uuid("roadmap_id")
    .notNull()
    .references(() => roadmaps.id),
  stepId: bigint("step_id", { mode: "number" })
    .notNull()
    .references(() => steps.id),
  isAchieved: boolean("is_achieved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").defaultRandom().notNull().unique(),
  userId: uuid("user_id").notNull(),
  roadmapId: uuid("roadmap_id")
    .notNull()
    .references(() => roadmaps.id),
  stepGoalId: bigint("step_goal_id", { mode: "number" })
    .notNull()
    .references(() => stepGoals.id),
  actDate: date("act_date").notNull(),
  actContents: text("act_contents"),
  actCount: smallint("act_count"),
  actMinutes: smallint("act_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  userId: uuid("user_id").primaryKey(),
  categories: json("categories").$type<string[]>().notNull(),
  stepProgressType: smallint("step_progress_type").notNull().default(0),
  activitySummaryDays: smallint("activity_summary_days").notNull().default(7),
  theme: text("theme").default("system").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define the type
export type Roadmap = typeof roadmaps.$inferSelect;
export type Step = typeof steps.$inferSelect;
export type StepGoal = typeof stepGoals.$inferSelect;
export type StepGoalState = typeof stepGoalStates.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Setting = typeof settings.$inferSelect;
