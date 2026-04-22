import { beforeEach, describe, expect, it } from "vitest";

import { createInboxItem, resetInboxStore } from "@/db/queries/inbox";

import { createInboxFactory } from "./factories/inbox";

describe("inbox domain", () => {
  beforeEach(async () => {
    await resetInboxStore();
  });

  it("defaults priority and status and keeps triage pending", async () => {
    const item = await createInboxItem(createInboxFactory());

    expect(item.priorityReviewed).toBe("Media");
    expect(item.status).toBe("Nova");
    expect(item.triageStatus).toBe("pending");
  });

  it("preserves AI and reviewed fields as separate concerns", async () => {
    const item = await createInboxItem(createInboxFactory());

    expect(item.aiSuggestion).toBeNull();
    expect(item.reviewedCategory).toBeNull();
    expect(item.reviewedNextAction).toBeNull();
  });
});
