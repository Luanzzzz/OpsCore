import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const agendaKindEnum = pgEnum("agenda_kind", [
  "follow_up",
  "deadline",
  "commitment"
]);

export const agendaStatusEnum = pgEnum("agenda_status", [
  "Aberto",
  "Concluido",
  "Cancelado"
]);

export const agendaItems = pgTable("agenda_items", {
  id: serial("id").primaryKey(),
  linkedType: text("linked_type").notNull(),
  linkedId: integer("linked_id").notNull(),
  title: text("title").notNull(),
  kind: agendaKindEnum("kind").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  status: agendaStatusEnum("status").notNull().default("Aberto"),
  ownerName: text("owner_name"),
  notes: text("notes"),
  originSnapshot: jsonb("origin_snapshot").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
});
