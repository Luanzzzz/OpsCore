import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAgendaItem, resetAgendaStore } from "@/db/queries/agenda";
import { createInboxItem, resetInboxStore, reviewInboxItem } from "@/db/queries/inbox";
import { getOperationalPanorama } from "@/db/queries/panorama";
import {
  createTaskFromInbox,
  resetTasksStore,
  updateTaskStatus
} from "@/db/queries/tasks";

import { buildReviewedInboxSeed } from "./fixtures";

async function createReviewedInboxItem() {
  const seed = buildReviewedInboxSeed({
    createInput: {
      title: "Contrato com risco operacional",
      source: "email",
      summaryShort: "Cliente aguarda retorno de proposta.",
      priorityReviewed: "Critica",
      waitingOnResponse: true
    },
    reviewInput: {
      reviewedCategory: "Comercial",
      reviewedNextAction: "Responder proposta",
      priorityReviewed: "Critica",
      status: "Aguardando resposta",
      waitingOnResponse: true
    }
  });
  const item = await createInboxItem(seed.createInput);

  const reviewed = await reviewInboxItem(item.id, seed.reviewInput);

  expect(reviewed).not.toBeNull();
  return reviewed!;
}

describe("panorama domain", () => {
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

  it("derives operational panorama from real inbox, task and agenda stores", async () => {
    const reviewed = await createReviewedInboxItem();
    const taskResult = await createTaskFromInbox({
      originInboxId: reviewed.id,
      ownerName: null,
      priority: "Critica",
      status: "Nao iniciada"
    });

    if (!taskResult.ok) {
      throw new Error("Expected task creation to succeed");
    }

    await updateTaskStatus(taskResult.task.id, {
      status: "Bloqueada",
      movementNote: "Aguardando insumo do cliente."
    });
    await createAgendaItem({
      linkedType: "task",
      linkedId: taskResult.task.id,
      kind: "deadline",
      dueAt: "2026-04-19T12:00:00.000Z"
    });
    await createAgendaItem({
      linkedType: "inbox",
      linkedId: reviewed.id,
      kind: "follow_up",
      dueAt: "2026-04-22T12:00:00.000Z"
    });

    const panorama = await getOperationalPanorama();

    expect(panorama.modules.map((module) => module.id)).toEqual([
      "inbox",
      "execution",
      "agenda"
    ]);
    expect(panorama.modules.find((module) => module.id === "inbox")).toMatchObject({
      route: "/inbox",
      totalCount: 1,
      pressureCount: expect.any(Number)
    });
    expect(panorama.modules.find((module) => module.id === "execution")).toMatchObject({
      activeCount: 1,
      pressureCount: 3
    });
    expect(panorama.modules.find((module) => module.id === "agenda")).toMatchObject({
      activeCount: 2,
      pressureCount: 2
    });
    expect(panorama.signals.map((signal) => signal.id)).toEqual(
      expect.arrayContaining([
        "inbox-waiting-response",
        "execution-blocked",
        "execution-unassigned",
        "agenda-overdue",
        "agenda-upcoming"
      ])
    );
    expect(panorama.signals).toHaveLength(5);
    expect(panorama.intelligenceReadiness.status).toBe("preparing");
    expect(panorama.integrationReadiness.status).toBe("preparing");
    expect(panorama.contextPacket.modules).toHaveLength(3);
    expect(panorama.contextPacket.signals[0]).not.toHaveProperty("detail");
    expect(JSON.stringify(panorama.contextPacket)).not.toContain("descriptionRaw");
    expect(panorama.nextMilestoneOptions.map((option) => option.direction)).toEqual([
      "stronger-intelligence",
      "external-channels"
    ]);
  });

  it("keeps the panorama empty state deterministic when stores are empty", async () => {
    const panorama = await getOperationalPanorama();

    expect(panorama.modules).toHaveLength(3);
    expect(panorama.modules.every((module) => module.totalCount === 0)).toBe(true);
    expect(panorama.signals).toEqual([]);
    expect(panorama.contextPacket.signals).toEqual([]);
    expect(panorama.nextMilestoneOptions[0].readiness).toBe("medium");
  });
});
