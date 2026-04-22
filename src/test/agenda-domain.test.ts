import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAgendaItem,
  getAgendaItemById,
  getAgendaItems,
  getAgendaSummary,
  getAgendaUrgencyState,
  resetAgendaStore,
  updateAgendaItem,
  updateAgendaStatus
} from "@/db/queries/agenda";
import { createInboxItem, resetInboxStore, reviewInboxItem } from "@/db/queries/inbox";
import { createTaskFromInbox, resetTasksStore } from "@/db/queries/tasks";
import {
  agendaKindSchema,
  agendaLinkedTypeSchema,
  agendaStatusSchema,
  createAgendaItemSchema,
  updateAgendaItemSchema,
  updateAgendaStatusSchema
} from "@/lib/validation/agenda";

import { buildReviewedInboxSeed } from "./fixtures";

async function createReviewedInboxItem() {
  const seed = buildReviewedInboxSeed({
    createInput: {
      title: "Contrato com retorno pendente",
      source: "email",
      summaryShort: "Cliente pediu ajuste na proposta.",
      priorityReviewed: "Critica"
    },
    reviewInput: {
      reviewedCategory: "Comercial",
      reviewedNextAction: "Enviar proposta revisada",
      priorityReviewed: "Critica",
      status: "Aguardando resposta"
    }
  });
  const item = await createInboxItem(seed.createInput);

  const reviewed = await reviewInboxItem(item.id, seed.reviewInput);

  expect(reviewed).not.toBeNull();
  return reviewed!;
}

describe("agenda domain", () => {
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

  it("defines linked origin, kind and status contracts", () => {
    expect(agendaLinkedTypeSchema.options).toEqual(["inbox", "task"]);
    expect(agendaKindSchema.options).toEqual([
      "follow_up",
      "deadline",
      "commitment"
    ]);
    expect(agendaStatusSchema.options).toEqual([
      "Aberto",
      "Concluido",
      "Cancelado"
    ]);
  });

  it("coerces ids, normalizes empty strings and rejects invalid dueAt values", () => {
    expect(
      createAgendaItemSchema.parse({
        linkedType: "inbox",
        linkedId: "42",
        kind: "follow_up",
        dueAt: "2026-04-21T12:00:00.000Z",
        ownerName: "",
        notes: ""
      })
    ).toMatchObject({
      linkedType: "inbox",
      linkedId: 42,
      kind: "follow_up",
      ownerName: null,
      notes: null
    });

    expect(
      updateAgendaItemSchema.parse({
        title: "  Retomar contrato  ",
        ownerName: "",
        notes: ""
      })
    ).toMatchObject({
      title: "Retomar contrato",
      ownerName: null,
      notes: null
    });

    expect(
      updateAgendaStatusSchema.parse({
        status: "Cancelado",
        movementNote: ""
      })
    ).toMatchObject({
      status: "Cancelado",
      movementNote: null
    });

    expect(() =>
      createAgendaItemSchema.parse({
        linkedType: "task",
        linkedId: "1",
        kind: "deadline",
        dueAt: "amanha"
      })
    ).toThrow();
  });

  it("creates agenda items from inbox with server-built origin snapshots", async () => {
    const reviewed = await createReviewedInboxItem();

    const result = await createAgendaItem({
      linkedType: "inbox",
      linkedId: reviewed.id,
      kind: "follow_up",
      title: "Retomar proposta",
      dueAt: "2026-04-20T18:00:00.000Z",
      ownerName: "",
      notes: "Confirmar se o ajuste foi aprovado."
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected agenda item creation to succeed");
    }

    expect(result.item).toMatchObject({
      linkedType: "inbox",
      linkedId: reviewed.id,
      kind: "follow_up",
      title: "Retomar proposta",
      status: "Aberto",
      ownerName: null,
      notes: "Confirmar se o ajuste foi aprovado.",
      urgencyState: "hoje",
      originSnapshot: {
        linkedType: "inbox",
        linkedId: reviewed.id,
        title: "Contrato com retorno pendente",
        sourceLabel: "email",
        summary: "Cliente pediu ajuste na proposta.",
        priority: "Critica",
        ownerName: null,
        statusLabel: "Aguardando resposta"
      }
    });
    expect(result.item.timeline[0]).toMatchObject({
      type: "created",
      toStatus: "Aberto"
    });
  });

  it("creates agenda items from tasks with owner and task state in the snapshot", async () => {
    const reviewed = await createReviewedInboxItem();
    const taskResult = await createTaskFromInbox({
      originInboxId: reviewed.id,
      ownerName: "Luan",
      priority: "Alta",
      status: "Em andamento"
    });

    if (!taskResult.ok) {
      throw new Error("Expected task creation to succeed");
    }

    const result = await createAgendaItem({
      linkedType: "task",
      linkedId: taskResult.task.id,
      kind: "deadline",
      dueAt: "2026-04-22T12:00:00.000Z"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected agenda item creation to succeed");
    }

    expect(result.item).toMatchObject({
      linkedType: "task",
      linkedId: taskResult.task.id,
      kind: "deadline",
      title: taskResult.task.title,
      ownerName: "Luan",
      urgencyState: "proximo",
      originSnapshot: {
        linkedType: "task",
        linkedId: taskResult.task.id,
        title: taskResult.task.title,
        sourceLabel: "email",
        priority: "Alta",
        ownerName: "Luan",
        statusLabel: "Em andamento"
      }
    });
  });

  it("rejects missing linked origins and exact active duplicates", async () => {
    const missing = await createAgendaItem({
      linkedType: "inbox",
      linkedId: 999,
      kind: "follow_up",
      dueAt: "2026-04-20T18:00:00.000Z"
    });
    expect(missing).toEqual({ ok: false, code: "linked-origin-not-found" });

    const reviewed = await createReviewedInboxItem();
    const payload = {
      linkedType: "inbox" as const,
      linkedId: reviewed.id,
      kind: "follow_up" as const,
      dueAt: "2026-04-20T18:00:00.000Z"
    };
    const first = await createAgendaItem(payload);
    const duplicate = await createAgendaItem(payload);

    expect(first.ok).toBe(true);
    expect(duplicate).toEqual({ ok: false, code: "active-duplicate" });
  });

  it("classifies temporal urgency with centralized thresholds", () => {
    expect(
      getAgendaUrgencyState("2026-04-20T11:59:59.000Z", "Aberto")
    ).toBe("vencido");
    expect(
      getAgendaUrgencyState("2026-04-21T12:00:00.000Z", "Aberto")
    ).toBe("hoje");
    expect(
      getAgendaUrgencyState("2026-04-23T12:00:00.000Z", "Aberto")
    ).toBe("proximo");
    expect(
      getAgendaUrgencyState("2026-04-23T12:00:01.000Z", "Aberto")
    ).toBe("futuro");
    expect(
      getAgendaUrgencyState("2026-04-19T12:00:00.000Z", "Concluido")
    ).toBe("futuro");
  });

  it("lists, filters and summarizes active agenda risk states", async () => {
    const reviewed = await createReviewedInboxItem();
    await createAgendaItem({
      linkedType: "inbox",
      linkedId: reviewed.id,
      kind: "follow_up",
      dueAt: "2026-04-19T12:00:00.000Z"
    });
    await createAgendaItem({
      linkedType: "inbox",
      linkedId: reviewed.id,
      kind: "deadline",
      dueAt: "2026-04-21T08:00:00.000Z"
    });
    await createAgendaItem({
      linkedType: "inbox",
      linkedId: reviewed.id,
      kind: "commitment",
      dueAt: "2026-04-22T13:00:00.000Z"
    });
    await createAgendaItem({
      linkedType: "inbox",
      linkedId: reviewed.id,
      kind: "follow_up",
      dueAt: "2026-04-24T12:00:00.000Z"
    });

    const items = await getAgendaItems();
    const overdue = await getAgendaItems({ urgencyState: "vencido" });
    const summary = await getAgendaSummary();

    expect(items.map((item) => item.urgencyState)).toEqual([
      "vencido",
      "hoje",
      "proximo",
      "futuro"
    ]);
    expect(overdue).toHaveLength(1);
    expect(summary).toMatchObject({
      totalCount: 4,
      activeCount: 4,
      overdueCount: 1,
      dueTodayCount: 1,
      upcomingCount: 1,
      futureCount: 1,
      completedCount: 0,
      cancelledCount: 0
    });
  });

  it("updates, reschedules and closes agenda items without counting closed risks", async () => {
    const reviewed = await createReviewedInboxItem();
    const result = await createAgendaItem({
      linkedType: "inbox",
      linkedId: reviewed.id,
      kind: "follow_up",
      dueAt: "2026-04-19T12:00:00.000Z"
    });

    if (!result.ok) {
      throw new Error("Expected agenda item creation to succeed");
    }

    const rescheduled = await updateAgendaItem(result.item.id, {
      dueAt: "2026-04-24T12:00:00.000Z",
      ownerName: "Maria",
      notes: "Retomar depois da revisao."
    });

    expect(rescheduled).toMatchObject({
      ownerName: "Maria",
      notes: "Retomar depois da revisao.",
      urgencyState: "futuro"
    });
    expect(rescheduled?.timeline.at(-1)).toMatchObject({
      type: "rescheduled",
      fromDueAt: "2026-04-19T12:00:00.000Z",
      toDueAt: "2026-04-24T12:00:00.000Z"
    });

    const completed = await updateAgendaStatus(result.item.id, {
      status: "Concluido",
      movementNote: "Cliente respondeu."
    });
    const persisted = await getAgendaItemById(result.item.id);
    const summary = await getAgendaSummary();

    expect(completed).toMatchObject({
      status: "Concluido",
      urgencyState: "futuro"
    });
    expect(completed?.completedAt).toEqual("2026-04-20T12:00:00.000Z");
    expect(persisted?.timeline.at(-1)).toMatchObject({
      type: "completed",
      fromStatus: "Aberto",
      toStatus: "Concluido"
    });
    expect(summary).toMatchObject({
      activeCount: 0,
      overdueCount: 0,
      completedCount: 1
    });
  });
});
