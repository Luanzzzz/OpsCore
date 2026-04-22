import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const taskStatusEnum = pgEnum("task_status", [
  "Nao iniciada",
  "Em andamento",
  "Bloqueada",
  "Concluida"
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "Baixa",
  "Media",
  "Alta",
  "Critica"
]);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  originInboxId: integer("origin_inbox_id").notNull(),
  title: text("title").notNull(),
  ownerName: text("owner_name"),
  priority: taskPriorityEnum("priority").notNull().default("Media"),
  status: taskStatusEnum("status").notNull().default("Nao iniciada"),
  contextNote: text("context_note"),
  lastMovementAt: timestamp("last_movement_at", {
    withTimezone: true
  }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull()
});
