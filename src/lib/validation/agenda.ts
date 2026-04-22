import { z } from "zod";

import {
  AGENDA_KINDS,
  AGENDA_LINKED_TYPES,
  AGENDA_STATUSES,
  AGENDA_URGENCY_STATES
} from "@/types/agenda";

const emptyStringToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const nullableTextSchema = z.preprocess(
  emptyStringToNull,
  z.string().trim().min(1).max(500).nullable().optional()
);

const optionalTextSchema = z.string().trim().min(1).max(160).optional();

const dueAtSchema = z
  .string()
  .trim()
  .datetime({ offset: true })
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid dueAt"
  });

export const agendaLinkedTypeSchema = z.enum(AGENDA_LINKED_TYPES);

export const agendaKindSchema = z.enum(AGENDA_KINDS);

export const agendaStatusSchema = z.enum(AGENDA_STATUSES);

export const agendaUrgencyStateSchema = z.enum(AGENDA_URGENCY_STATES);

export const agendaFiltersSchema = z.object({
  linkedType: agendaLinkedTypeSchema.optional(),
  kind: agendaKindSchema.optional(),
  status: agendaStatusSchema.optional(),
  urgencyState: agendaUrgencyStateSchema.optional(),
  owner: z.string().trim().optional(),
  sort: z.enum(["urgency", "dueAt", "recent"]).optional()
});

export const createAgendaItemSchema = z.object({
  linkedType: agendaLinkedTypeSchema,
  linkedId: z.coerce.number().int().positive(),
  kind: agendaKindSchema,
  title: optionalTextSchema,
  dueAt: dueAtSchema,
  ownerName: nullableTextSchema,
  notes: nullableTextSchema
});

export const updateAgendaItemSchema = z.object({
  kind: agendaKindSchema.optional(),
  title: optionalTextSchema,
  dueAt: dueAtSchema.optional(),
  ownerName: nullableTextSchema,
  notes: nullableTextSchema
});

export const updateAgendaStatusSchema = z.object({
  status: agendaStatusSchema,
  movementNote: nullableTextSchema
});
