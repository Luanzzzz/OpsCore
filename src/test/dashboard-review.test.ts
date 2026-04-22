import { beforeEach, describe, expect, it } from "vitest";

import { POST as reviewInbox } from "@/app/api/inbox/[id]/review/route";
import { POST as runTriage } from "@/app/api/triage/route";
import { GET as getDashboard } from "@/app/api/dashboard/route";
import { createInboxItem, resetInboxStore } from "@/db/queries/inbox";

import { createInboxFactory } from "./factories/inbox";

describe("dashboard and review", () => {
  beforeEach(async () => {
    delete process.env.OPENAI_API_KEY;
    await resetInboxStore();
  });

  it("preserves AI suggestion while human review updates the reviewed state", async () => {
    const created = await createInboxItem(createInboxFactory());

    const triageResponse = await runTriage(
      new Request("http://localhost/api/triage", {
        method: "POST",
        body: JSON.stringify({ inboxId: created.id }),
        headers: { "Content-Type": "application/json" }
      })
    );
    const triageBody = await triageResponse.json();

    const reviewResponse = await reviewInbox(
      new Request(`http://localhost/api/inbox/${created.id}/review`, {
        method: "POST",
        body: JSON.stringify({
          reviewedCategory: "Comercial",
          reviewedNextAction: "Responder cliente ainda hoje",
          priorityReviewed: "Critica",
          waitingOnResponse: true,
          status: "Aguardando resposta"
        }),
        headers: { "Content-Type": "application/json" }
      }),
      { params: Promise.resolve({ id: String(created.id) }) }
    );
    const reviewed = await reviewResponse.json();

    expect(triageBody.item.aiSuggestion).not.toBeNull();
    expect(reviewed.aiSuggestion).not.toBeNull();
    expect(reviewed.triageStatus).toBe("reviewed");
    expect(reviewed.reviewedCategory).toBe("Comercial");
  });

  it("derives dashboard metrics from real inbox state", async () => {
    const created = await createInboxItem({
      ...createInboxFactory(),
      waitingOnResponse: true
    });

    await runTriage(
      new Request("http://localhost/api/triage", {
        method: "POST",
        body: JSON.stringify({ inboxId: created.id }),
        headers: { "Content-Type": "application/json" }
      })
    );

    await reviewInbox(
      new Request(`http://localhost/api/inbox/${created.id}/review`, {
        method: "POST",
        body: JSON.stringify({
          priorityReviewed: "Alta",
          waitingOnResponse: true,
          status: "Aguardando resposta"
        }),
        headers: { "Content-Type": "application/json" }
      }),
      { params: Promise.resolve({ id: String(created.id) }) }
    );

    const response = await getDashboard();
    const dashboard = await response.json();

    expect(dashboard.highPriorityCount).toBe(1);
    expect(dashboard.waitingOnResponseCount).toBe(1);
    expect(dashboard.byStatus.some((item: { status: string; count: number }) => item.status === "Aguardando resposta" && item.count === 1)).toBe(true);
  });
});
