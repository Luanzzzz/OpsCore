import { z } from "zod";

export const inboxStatusSchema = z.enum([
  "Nova",
  "Em analise",
  "Aguardando resposta",
  "Concluida/Arquivada"
]);

export const inboxPrioritySchema = z.enum(["Baixa", "Media", "Alta", "Critica"]);

export const triageStatusSchema = z.enum(["pending", "ready", "reviewed"]);

export const createInboxInputSchema = z.object({
  title: z.string().trim().min(1),
  source: z.string().trim().min(1),
  summaryShort: z.string().trim().min(1),
  descriptionRaw: z.string().trim().optional(),
  status: inboxStatusSchema.optional(),
  priorityReviewed: inboxPrioritySchema.optional(),
  waitingOnResponse: z.boolean().optional()
});

export const inboxFiltersSchema = z.object({
  status: inboxStatusSchema.optional(),
  priority: inboxPrioritySchema.optional()
});

export const triageReviewSchema = z.object({
  reviewedCategory: z.string().trim().nullable().optional(),
  reviewedNextAction: z.string().trim().nullable().optional(),
  priorityReviewed: inboxPrioritySchema.optional(),
  status: inboxStatusSchema.optional(),
  waitingOnResponse: z.boolean().optional()
});
