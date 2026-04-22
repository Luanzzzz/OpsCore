import { beforeEach, describe, expect, it } from "vitest";

import { createInboxItem, resetInboxStore, reviewInboxItem } from "@/db/queries/inbox";
import {
  createTaskFromInbox,
  getExecutionSummary,
  getReadyToConvertItems,
  getTaskById,
  resetTasksStore,
  updateTaskMeta,
  updateTaskStatus
} from "@/db/queries/tasks";
import {
  createTaskFromInboxSchema,
  taskPrioritySchema,
  taskStatusSchema,
  updateTaskMetaSchema,
  updateTaskStatusSchema
} from "@/lib/validation/tasks";

import { buildReviewedInboxSeed } from "./fixtures";

async function createReviewedInboxItem() {
  const seed = buildReviewedInboxSeed({
    createInput: {
      title: "Contrato aguardando execucao",
      source: "email",
      summaryShort: "Cliente aprovou a proposta.",
      priorityReviewed: "Critica"
    },
    reviewInput: {
      reviewedCategory: "Comercial",
      reviewedNextAction: "Preparar kickoff operacional",
      priorityReviewed: "Critica",
      status: "Em analise"
    }
  });
  const item = await createInboxItem(seed.createInput);

  const reviewed = await reviewInboxItem(item.id, seed.reviewInput);

  expect(reviewed).not.toBeNull();
  return reviewed!;
}

describe("tasks domain", () => {
  beforeEach(async () => {
    await resetInboxStore();
    await resetTasksStore();
  });

  it("defines closed status, priority and mutation payload contracts", () => {
    expect(taskStatusSchema.options).toEqual([
      "Nao iniciada",
      "Em andamento",
      "Bloqueada",
      "Concluida"
    ]);
    expect(taskPrioritySchema.options).toEqual([
      "Baixa",
      "Media",
      "Alta",
      "Critica"
    ]);
    expect(
      createTaskFromInboxSchema.parse({
        originInboxId: "1",
        ownerName: "",
        priority: "Alta",
        status: "Nao iniciada",
        contextNote: ""
      })
    ).toMatchObject({
      originInboxId: 1,
      ownerName: null,
      priority: "Alta",
      status: "Nao iniciada",
      contextNote: null
    });
    expect(updateTaskMetaSchema.parse({ ownerName: "", priority: "Media" }))
      .toMatchObject({
        ownerName: null,
        priority: "Media"
      });
    expect(
      updateTaskStatusSchema.parse({
        status: "Bloqueada",
        movementNote: ""
      })
    ).toMatchObject({ status: "Bloqueada", movementNote: null });
  });

  it("exposes reviewed triage context in ready-to-convert items", async () => {
    const reviewed = await createReviewedInboxItem();

    const readyToConvert = await getReadyToConvertItems();

    expect(readyToConvert).toHaveLength(1);
    expect(readyToConvert[0]).toMatchObject({
      id: reviewed.id,
      title: "Contrato aguardando execucao",
      source: "email",
      summaryShort: "Cliente aprovou a proposta.",
      priorityReviewed: "Critica",
      reviewedCategory: "Comercial",
      reviewedNextAction: "Preparar kickoff operacional",
      triageStatus: "reviewed"
    });
    expect(readyToConvert[0].ageHours).toEqual(expect.any(Number));
  });

  it("converts a reviewed inbox item into an operational task with origin snapshot", async () => {
    const reviewed = await createReviewedInboxItem();

    const result = await createTaskFromInbox({
      originInboxId: reviewed.id,
      ownerName: "Luan",
      status: "Nao iniciada"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected conversion to succeed");
    }

    expect(result.task).toMatchObject({
      originInboxId: reviewed.id,
      ownerName: "Luan",
      priority: "Critica",
      status: "Nao iniciada",
      origin: {
        inboxId: reviewed.id,
        title: reviewed.title,
        source: reviewed.source,
        summaryShort: reviewed.summaryShort,
        reviewedCategory: "Comercial",
        reviewedNextAction: "Preparar kickoff operacional",
        triageStatus: "reviewed"
      }
    });
    expect(result.task.timeline[0]).toMatchObject({
      type: "conversion",
      toStatus: "Nao iniciada"
    });
  });

  it("rejects missing origins and duplicate active conversions", async () => {
    const missing = await createTaskFromInbox({ originInboxId: 999 });
    expect(missing).toEqual({ ok: false, code: "origin-not-found" });

    const reviewed = await createReviewedInboxItem();
    const first = await createTaskFromInbox({ originInboxId: reviewed.id });
    const second = await createTaskFromInbox({ originInboxId: reviewed.id });

    expect(first.ok).toBe(true);
    expect(second).toEqual({ ok: false, code: "origin-already-active" });
  });

  it("updates metadata and status without losing linked origin", async () => {
    const reviewed = await createReviewedInboxItem();
    const result = await createTaskFromInbox({ originInboxId: reviewed.id });

    if (!result.ok) {
      throw new Error("Expected conversion to succeed");
    }

    const metaUpdated = await updateTaskMeta(result.task.id, {
      ownerName: "Maria",
      priority: "Alta"
    });
    expect(metaUpdated).toMatchObject({
      ownerName: "Maria",
      priority: "Alta",
      status: "Nao iniciada",
      originInboxId: reviewed.id
    });
    expect(metaUpdated?.timeline.at(-1)).toMatchObject({
      type: "meta_updated"
    });

    const statusUpdated = await updateTaskStatus(result.task.id, {
      status: "Bloqueada",
      movementNote: "Aguardando resposta do cliente"
    });
    expect(statusUpdated).toMatchObject({
      ownerName: "Maria",
      priority: "Alta",
      status: "Bloqueada",
      origin: {
        reviewedNextAction: "Preparar kickoff operacional"
      }
    });
    expect(statusUpdated?.timeline.at(-1)).toMatchObject({
      type: "status_updated",
      fromStatus: "Nao iniciada",
      toStatus: "Bloqueada"
    });

    const persisted = await getTaskById(result.task.id);
    expect(persisted?.origin.reviewedNextAction).toBe(
      "Preparar kickoff operacional"
    );
  });

  it("summarizes execution backlog counters and excludes active origins from conversion strip", async () => {
    const first = await createReviewedInboxItem();
    const second = await createInboxItem({
      ...buildReviewedInboxSeed().createInput,
      title: "Documento pronto para delegar",
      priorityReviewed: "Alta"
    });
    await reviewInboxItem(second.id, {
      reviewedCategory: "Operacao",
      reviewedNextAction: "Delegar documento",
      priorityReviewed: "Alta"
    });

    const result = await createTaskFromInbox({
      originInboxId: first.id,
      priority: "Critica"
    });
    if (!result.ok) {
      throw new Error("Expected conversion to succeed");
    }
    await updateTaskStatus(result.task.id, { status: "Bloqueada" });

    const summary = await getExecutionSummary();
    const readyToConvert = await getReadyToConvertItems();

    expect(summary).toMatchObject({
      totalCount: 1,
      activeCount: 1,
      readyToConvertCount: 1,
      unassignedCount: 1,
      blockedCount: 1,
      criticalCount: 1,
      agedCount: 0
    });
    expect(readyToConvert).toHaveLength(1);
    expect(readyToConvert[0]).toMatchObject({
      id: second.id,
      reviewedNextAction: "Delegar documento"
    });
  });
});
