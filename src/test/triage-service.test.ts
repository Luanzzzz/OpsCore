import { beforeEach, describe, expect, it } from "vitest";

import { createInboxItem, getInboxItemById, resetInboxStore } from "@/db/queries/inbox";
import { triageInboxItem } from "@/lib/triage/service";

import { createInboxFactory } from "./factories/inbox";

describe("triage service", () => {
  beforeEach(async () => {
    delete process.env.OPENAI_API_KEY;
    await resetInboxStore();
  });

  it("returns the exact triage keys with supported urgency", async () => {
    const created = await createInboxItem(createInboxFactory());
    const suggestion = await triageInboxItem(created);

    expect(Object.keys(suggestion)).toEqual([
      "category",
      "urgency",
      "nextAction",
      "summary",
      "rationale"
    ]);
    expect(["Baixa", "Media", "Alta", "Critica"]).toContain(suggestion.urgency);
  });

  it("does not mutate reviewed fields while generating AI suggestion", async () => {
    const created = await createInboxItem(createInboxFactory());
    await triageInboxItem(created);
    const persisted = await getInboxItemById(created.id);

    expect(persisted?.priorityReviewed).toBe("Media");
    expect(persisted?.reviewedCategory).toBeNull();
    expect(persisted?.reviewedNextAction).toBeNull();
  });
});
