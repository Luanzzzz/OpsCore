import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const inboxStatusEnum = pgEnum("inbox_status", [
  "Nova",
  "Em analise",
  "Aguardando resposta",
  "Concluida/Arquivada"
]);

export const inboxPriorityEnum = pgEnum("inbox_priority", [
  "Baixa",
  "Media",
  "Alta",
  "Critica"
]);

export const triageStatusEnum = pgEnum("triage_status", [
  "pending",
  "ready",
  "reviewed"
]);

export const inboxItems = pgTable("inbox_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  summaryShort: text("summary_short").notNull(),
  descriptionRaw: text("description_raw").notNull(),
  status: inboxStatusEnum("status").notNull().default("Nova"),
  priorityReviewed: inboxPriorityEnum("priority_reviewed")
    .notNull()
    .default("Media"),
  waitingOnResponse: boolean("waiting_on_response").notNull().default(false),
  lastActivityAt: timestamp("last_activity_at", {
    withTimezone: true
  }).notNull(),
  triageStatus: triageStatusEnum("triage_status").notNull().default("pending"),
  aiCategory: text("ai_category"),
  aiUrgency: inboxPriorityEnum("ai_urgency"),
  aiNextAction: text("ai_next_action"),
  aiSummary: text("ai_summary"),
  aiRationale: text("ai_rationale"),
  reviewedCategory: text("reviewed_category"),
  reviewedNextAction: text("reviewed_next_action"),
  triageReviewedAt: timestamp("triage_reviewed_at", {
    withTimezone: true
  }),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull()
});
