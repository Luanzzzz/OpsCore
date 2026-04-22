import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET as getPanorama } from "@/app/api/panorama/route";
import { createAgendaItem, resetAgendaStore } from "@/db/queries/agenda";
import { createInboxItem, resetInboxStore, reviewInboxItem } from "@/db/queries/inbox";
import {
  createTaskFromInbox,
  resetTasksStore,
  updateTaskStatus
} from "@/db/queries/tasks";

import { buildReviewedInboxSeed } from "./fixtures";

async function seedPanoramaState() {
  const seed = buildReviewedInboxSeed({
    createInput: {
      title: "Contrato para panorama",
      source: "email",
      summaryShort: "Cliente aguarda resposta.",
      descriptionRaw: "Conteudo bruto que nao deve sair no panorama.",
      priorityReviewed: "Critica",
      waitingOnResponse: true
    },
    reviewInput: {
      reviewedCategory: "Comercial",
      reviewedNextAction: "Responder cliente",
      priorityReviewed: "Critica",
      status: "Aguardando resposta",
      waitingOnResponse: true
    }
  });
  const item = await createInboxItem(seed.createInput);
  const reviewed = await reviewInboxItem(item.id, seed.reviewInput);

  if (!reviewed) {
    throw new Error("Expected review to succeed");
  }

  const task = await createTaskFromInbox({
    originInboxId: reviewed.id,
    status: "Nao iniciada"
  });

  if (!task.ok) {
    throw new Error("Expected task creation to succeed");
  }

  await updateTaskStatus(task.task.id, { status: "Bloqueada" });
  await createAgendaItem({
    linkedType: "task",
    linkedId: task.task.id,
    kind: "deadline",
    dueAt: "2026-04-19T12:00:00.000Z"
  });
}

describe("panorama api", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-20T12:00:00.000Z"));
    await resetInboxStore();
    await resetTasksStore();
    await resetAgendaStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns read-only operational panorama without raw fields", async () => {
    await seedPanoramaState();

    const response = await getPanorama();
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(body.modules.map((module: { id: string }) => module.id)).toEqual([
      "inbox",
      "execution",
      "agenda"
    ]);
    expect(body.signals.map((signal: { id: string }) => signal.id)).toEqual(
      expect.arrayContaining([
        "inbox-waiting-response",
        "execution-blocked",
        "agenda-overdue"
      ])
    );
    expect(body.contextPacket.modules).toHaveLength(3);
    expect(serialized).not.toContain("descriptionRaw");
    expect(serialized).not.toContain("Conteudo bruto");
  });
});
