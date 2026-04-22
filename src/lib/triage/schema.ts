import { z } from "zod";

import { inboxPrioritySchema } from "@/lib/validation/inbox";

export const triageSuggestionSchema = z.object({
  category: z.string().trim().min(1),
  urgency: inboxPrioritySchema,
  nextAction: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  rationale: z.string().trim().min(1)
});

export type TriageSuggestionResult = z.infer<typeof triageSuggestionSchema>;

export const triageJsonSchema = {
  name: "opscore_triage_suggestion",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      category: { type: "string" },
      urgency: {
        type: "string",
        enum: ["Baixa", "Media", "Alta", "Critica"]
      },
      nextAction: { type: "string" },
      summary: { type: "string" },
      rationale: { type: "string" }
    },
    required: ["category", "urgency", "nextAction", "summary", "rationale"]
  }
} as const;
