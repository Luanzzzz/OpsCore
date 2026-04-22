import OpenAI from "openai";

import { triageSuggestionSchema, type TriageSuggestionResult } from "./schema";
import { buildTriagePrompt } from "./prompt";

import type { InboxDetail } from "@/types/inbox";

function fallbackSuggestion(item: InboxDetail): TriageSuggestionResult {
  const raw = `${item.title} ${item.summaryShort} ${item.descriptionRaw}`.toLowerCase();
  const urgency = /urgente|hoje|agora|critica/.test(raw) ? "Critica" : "Media";

  return {
    category: /cliente|lead|comercial/.test(raw) ? "Comercial" : "Operacional",
    urgency,
    nextAction:
      urgency === "Critica"
        ? "Revisar imediatamente e responder ainda hoje."
        : "Classificar o item e definir proximo responsavel.",
    summary: item.summaryShort,
    rationale:
      urgency === "Critica"
        ? "O texto indica necessidade de resposta imediata."
        : "O item precisa de triagem humana antes de seguir para execucao."
  };
}

export async function triageInboxItem(
  item: InboxDetail
): Promise<TriageSuggestionResult> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackSuggestion(item);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    input: buildTriagePrompt(item),
    text: {
      format: {
        type: "json_schema",
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
        },
        strict: true
      }
    }
  });

  const content = response.output_text;
  const parsed = JSON.parse(content);
  return triageSuggestionSchema.parse(parsed);
}
