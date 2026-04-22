import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as getAgendaDetail,
  PATCH as patchAgendaItem
} from "@/app/api/agenda/[id]/route";
import { POST as postAgendaStatus } from "@/app/api/agenda/[id]/status/route";
import {
  GET as getAgendaWorkspace,
  POST as postAgendaItem
} from "@/app/api/agenda/route";
import { resetAgendaStore } from "@/db/queries/agenda";
import { createInboxItem, resetInboxStore, reviewInboxItem } from "@/db/queries/inbox";
import { createTaskFromInbox, resetTasksStore } from "@/db/queries/tasks";

import { buildReviewedInboxSeed } from "./fixtures";

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function patchRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function routeContext(id: number | string) {
  return {
    params: Promise.resolve({ id: String(id) })
  };
}

async function createReviewedInboxItem(title = "Entrada com prazo") {
  const seed = buildReviewedInboxSeed({
    createInput: {
      title,
      source: "email",
      summaryShort: "Cliente pediu retorno operacional.",
      priorityReviewed: "Critica"
    },
    reviewInput: {
      reviewedCategory: "Comercial",
      reviewedNextAction: "Retomar com cliente",
      priorityReviewed: "Critica",
      status: "Aguardando resposta"
    }
  });
  const item = await createInboxItem(seed.createInput);

  const reviewed = await reviewInboxItem(item.id, seed.reviewInput);

  expect(reviewed).not.toBeNull();
  return reviewed!;
}

async function createTaskOrigin() {
  const reviewed = await createReviewedInboxItem("Tarefa com agenda");
  const taskResult = await createTaskFromInbox({
    originInboxId: reviewed.id,
    ownerName: "Luan",
    priority: "Alta",
    status: "Em andamento"
  });

  if (!taskResult.ok) {
    throw new Error("Expected task creation to succeed");
  }

  return taskResult.task;
}

describe("agenda api", () => {
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

  it("creates agenda items from inbox and task origins", async () => {
    const inbox = await createReviewedInboxItem();
    const inboxResponse = await postAgendaItem(
      jsonRequest("http://localhost/api/agenda", {
        linkedType: "inbox",
        linkedId: inbox.id,
        kind: "follow_up",
        title: "Retomar proposta",
        dueAt: "2026-04-20T18:00:00.000Z"
      }) as NextRequest
    );
    const inboxBody = await inboxResponse.json();

    expect(inboxResponse.status).toBe(201);
    expect(inboxBody).toMatchObject({
      linkedType: "inbox",
      linkedId: inbox.id,
      kind: "follow_up",
      urgencyState: "hoje",
      originSnapshot: {
        title: "Entrada com prazo",
        sourceLabel: "email"
      }
    });

    const task = await createTaskOrigin();
    const taskResponse = await postAgendaItem(
      jsonRequest("http://localhost/api/agenda", {
        linkedType: "task",
        linkedId: task.id,
        kind: "deadline",
        dueAt: "2026-04-22T12:00:00.000Z"
      }) as NextRequest
    );
    const taskBody = await taskResponse.json();

    expect(taskResponse.status).toBe(201);
    expect(taskBody).toMatchObject({
      linkedType: "task",
      linkedId: task.id,
      ownerName: "Luan",
      originSnapshot: {
        title: task.title,
        statusLabel: "Em andamento"
      }
    });
  });

  it("returns deterministic errors for invalid payloads, missing origins and duplicates", async () => {
    const invalid = await postAgendaItem(
      jsonRequest("http://localhost/api/agenda", {
        linkedType: "inbox",
        linkedId: "x",
        kind: "follow_up",
        dueAt: "amanha"
      }) as NextRequest
    );
    expect(invalid.status).toBe(400);

    const missing = await postAgendaItem(
      jsonRequest("http://localhost/api/agenda", {
        linkedType: "inbox",
        linkedId: 999,
        kind: "follow_up",
        dueAt: "2026-04-20T18:00:00.000Z"
      }) as NextRequest
    );
    const missingBody = await missing.json();

    expect(missing.status).toBe(404);
    expect(missingBody.error).toBe("Linked origin not found");

    const inbox = await createReviewedInboxItem();
    const payload = {
      linkedType: "inbox",
      linkedId: inbox.id,
      kind: "follow_up",
      dueAt: "2026-04-20T18:00:00.000Z"
    };
    await postAgendaItem(
      jsonRequest("http://localhost/api/agenda", payload) as NextRequest
    );
    const duplicate = await postAgendaItem(
      jsonRequest("http://localhost/api/agenda", payload) as NextRequest
    );
    const duplicateBody = await duplicate.json();

    expect(duplicate.status).toBe(409);
    expect(duplicateBody.error).toBe(
      "Agenda item already exists for this origin and due date"
    );
  });

  it("lists agenda workspace data and validates filters", async () => {
    const inbox = await createReviewedInboxItem();
    await postAgendaItem(
      jsonRequest("http://localhost/api/agenda", {
        linkedType: "inbox",
        linkedId: inbox.id,
        kind: "follow_up",
        dueAt: "2026-04-19T18:00:00.000Z"
      }) as NextRequest
    );

    const response = await getAgendaWorkspace(
      new NextRequest("http://localhost/api/agenda?urgencyState=vencido")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      urgencyState: "vencido",
      linkedType: "inbox"
    });
    expect(body.summary).toMatchObject({
      totalCount: 1,
      activeCount: 1,
      overdueCount: 1
    });

    const invalidFilter = await getAgendaWorkspace(
      new NextRequest("http://localhost/api/agenda?status=pendente")
    );
    expect(invalidFilter.status).toBe(400);
  });

  it("returns detail and patches agenda metadata without changing origin", async () => {
    const inbox = await createReviewedInboxItem();
    const createdResponse = await postAgendaItem(
      jsonRequest("http://localhost/api/agenda", {
        linkedType: "inbox",
        linkedId: inbox.id,
        kind: "deadline",
        dueAt: "2026-04-20T18:00:00.000Z"
      }) as NextRequest
    );
    const created = await createdResponse.json();

    const detailResponse = await getAgendaDetail(
      {} as Request,
      routeContext(created.id)
    );
    const detailBody = await detailResponse.json();

    expect(detailResponse.status).toBe(200);
    expect(detailBody.originSnapshot.title).toBe("Entrada com prazo");

    const patchResponse = await patchAgendaItem(
      patchRequest(`http://localhost/api/agenda/${created.id}`, {
        title: "Reagendar retorno",
        dueAt: "2026-04-24T12:00:00.000Z",
        ownerName: "Maria",
        notes: "Aguardar documento."
      }),
      routeContext(created.id)
    );
    const patched = await patchResponse.json();

    expect(patchResponse.status).toBe(200);
    expect(patched).toMatchObject({
      title: "Reagendar retorno",
      ownerName: "Maria",
      urgencyState: "futuro",
      originSnapshot: {
        title: "Entrada com prazo"
      }
    });
    expect(patched.timeline.at(-1)).toMatchObject({
      type: "rescheduled"
    });

    const missing = await getAgendaDetail({} as Request, routeContext(999));
    expect(missing.status).toBe(404);
  });

  it("concludes and cancels items through the dedicated status route", async () => {
    const inbox = await createReviewedInboxItem();
    const createdResponse = await postAgendaItem(
      jsonRequest("http://localhost/api/agenda", {
        linkedType: "inbox",
        linkedId: inbox.id,
        kind: "follow_up",
        dueAt: "2026-04-19T18:00:00.000Z"
      }) as NextRequest
    );
    const created = await createdResponse.json();

    const completedResponse = await postAgendaStatus(
      jsonRequest(`http://localhost/api/agenda/${created.id}/status`, {
        status: "Concluido",
        movementNote: "Cliente respondeu."
      }),
      routeContext(created.id)
    );
    const completed = await completedResponse.json();

    expect(completedResponse.status).toBe(200);
    expect(completed).toMatchObject({
      status: "Concluido",
      urgencyState: "futuro"
    });
    expect(completed.completedAt).toBe("2026-04-20T12:00:00.000Z");

    const workspace = await getAgendaWorkspace(
      new NextRequest("http://localhost/api/agenda")
    );
    const body = await workspace.json();
    expect(body.summary).toMatchObject({
      activeCount: 0,
      overdueCount: 0,
      completedCount: 1
    });

    const invalidStatus = await postAgendaStatus(
      jsonRequest(`http://localhost/api/agenda/${created.id}/status`, {
        status: "Pendente"
      }),
      routeContext(created.id)
    );
    expect(invalidStatus.status).toBe(400);

    const missing = await postAgendaStatus(
      jsonRequest("http://localhost/api/agenda/999/status", {
        status: "Cancelado"
      }),
      routeContext(999)
    );
    expect(missing.status).toBe(404);
  });
});
