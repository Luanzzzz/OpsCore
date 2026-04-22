import type { InboxDetail } from "@/types/inbox";

export function buildTriagePrompt(item: InboxDetail) {
  return [
    "Voce e um analista operacional do OpsCore.",
    "Gere uma triagem assistida para um item de inbox sem tomar decisoes autonomas.",
    "Responda apenas com os campos estruturados pedidos.",
    `Titulo: ${item.title}`,
    `Origem: ${item.source}`,
    `Resumo curto: ${item.summaryShort}`,
    `Descricao bruta: ${item.descriptionRaw}`
  ].join("\n");
}
