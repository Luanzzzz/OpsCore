import { z } from "zod";

import { TASK_PRIORITIES, TASK_STATUSES } from "@/types/tasks";

const emptyStringToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const nullableTextSchema = z.preprocess(
  emptyStringToNull,
  z.string().trim().min(1).nullable().optional()
);

export const taskStatusSchema = z.enum(TASK_STATUSES);

export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  owner: z.string().trim().optional(),
  ageBucket: z.enum(["all", "fresh", "aging", "stale"]).optional(),
  sort: z.enum(["priority", "oldest", "recent"]).optional()
});

export const createTaskFromInboxSchema = z.object({
  originInboxId: z.coerce.number().int().positive(),
  title: z.string().trim().min(1).optional(),
  ownerName: nullableTextSchema,
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  contextNote: nullableTextSchema
});

export const updateTaskMetaSchema = z.object({
  ownerName: nullableTextSchema,
  priority: taskPrioritySchema.optional()
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
  movementNote: nullableTextSchema
});
