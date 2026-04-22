import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";

import { POST as convertInboxToTask } from "@/app/api/inbox/[id]/convert/route";
import {
  GET as getTaskDetail,
  PATCH as patchTask
} from "@/app/api/tasks/[id]/route";
import { POST as postTaskStatus } from "@/app/api/tasks/[id]/status/route";
import { GET as getTasksWorkspace } from "@/app/api/tasks/route";
import { createInboxItem, resetInboxStore, reviewInboxItem } from "@/db/queries/inbox";
import { resetTasksStore } from "@/db/queries/tasks";

import { buildReviewedInboxSeed } from "./fixtures";

async function createReviewedInboxItem(title = "Entrada pronta para execucao") {
  const seed = buildReviewedInboxSeed({
    createInput: {
      title,
      source: "email",
      summaryShort: "Cliente confirmou prioridade operacional.",
      priorityReviewed: "Critica"
    },
    reviewInput: {
      reviewedCategory: "Operacao",
      reviewedNextAction: "Abrir tarefa com responsavel",
      priorityReviewed: "Critica",
      status: "Em analise"
    }
  });
  const item = await createInboxItem(seed.createInput);

  const reviewed = await reviewInboxItem(item.id, seed.reviewInput);

  expect(reviewed).not.toBeNull();
  return reviewed!;
}

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
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

describe("tasks api", () => {
  beforeEach(async () => {
    await resetInboxStore();
    await resetTasksStore();
  });

  it("converts a reviewed inbox item and rejects duplicate active conversion", async () => {
    const reviewed = await createReviewedInboxItem();

    const firstResponse = await convertInboxToTask(
      jsonRequest(`http://localhost/api/inbox/${reviewed.id}/convert`, {
        originInboxId: reviewed.id,
        ownerName: "Luan",
        priority: "Critica",
        status: "Nao iniciada"
      }),
      routeContext(reviewed.id)
    );
    const firstBody = await firstResponse.json();

    expect(firstResponse.status).toBe(201);
    expect(firstBody).toMatchObject({
      originInboxId: reviewed.id,
      ownerName: "Luan",
      status: "Nao iniciada",
      origin: {
        reviewedNextAction: "Abrir tarefa com responsavel"
      }
    });

    const duplicateResponse = await convertInboxToTask(
      jsonRequest(`http://localhost/api/inbox/${reviewed.id}/convert`, {
        originInboxId: reviewed.id
      }),
      routeContext(reviewed.id)
    );
    const duplicateBody = await duplicateResponse.json();

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateBody.error).toBe("Inbox item already has an active task");
  });

  it("returns deterministic conversion errors for invalid ids and missing origins", async () => {
    const invalidResponse = await convertInboxToTask(
      jsonRequest("http://localhost/api/inbox/x/convert", {
        originInboxId: "x"
      }),
      routeContext("x")
    );
    expect(invalidResponse.status).toBe(400);

    const missingResponse = await convertInboxToTask(
      jsonRequest("http://localhost/api/inbox/404/convert", {
        originInboxId: 404
      }),
      routeContext(404)
    );
    const missingBody = await missingResponse.json();

    expect(missingResponse.status).toBe(404);
    expect(missingBody.error).toBe("Inbox item not found");

    const reviewed = await createReviewedInboxItem();
    const mismatchResponse = await convertInboxToTask(
      jsonRequest(`http://localhost/api/inbox/${reviewed.id}/convert`, {
        originInboxId: reviewed.id + 1
      }),
      routeContext(reviewed.id)
    );

    expect(mismatchResponse.status).toBe(400);
  });

  it("lists execution workspace data with enriched readyToConvert shape", async () => {
    const converted = await createReviewedInboxItem("Contrato convertido");
    const ready = await createReviewedInboxItem("Documento pronto");

    await convertInboxToTask(
      jsonRequest(`http://localhost/api/inbox/${converted.id}/convert`, {
        originInboxId: converted.id,
        priority: "Critica",
        status: "Nao iniciada"
      }),
      routeContext(converted.id)
    );

    const response = await getTasksWorkspace(
      new NextRequest("http://localhost/api/tasks?status=Nao%20iniciada")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.summary).toMatchObject({
      totalCount: 1,
      readyToConvertCount: 1
    });
    expect(body.readyToConvert).toHaveLength(1);
    expect(body.readyToConvert[0]).toMatchObject({
      id: ready.id,
      reviewedCategory: "Operacao",
      reviewedNextAction: "Abrir tarefa com responsavel",
      priorityReviewed: "Critica",
      summaryShort: "Cliente confirmou prioridade operacional."
    });
  });

  it("returns task detail and 404 for missing task", async () => {
    const reviewed = await createReviewedInboxItem();
    const createResponse = await convertInboxToTask(
      jsonRequest(`http://localhost/api/inbox/${reviewed.id}/convert`, {
        originInboxId: reviewed.id
      }),
      routeContext(reviewed.id)
    );
    const created = await createResponse.json();

    const detailResponse = await getTaskDetail({} as Request, routeContext(created.id));
    const detailBody = await detailResponse.json();

    expect(detailResponse.status).toBe(200);
    expect(detailBody.origin.reviewedNextAction).toBe(
      "Abrir tarefa com responsavel"
    );

    const missingResponse = await getTaskDetail({} as Request, routeContext(999));
    const missingBody = await missingResponse.json();

    expect(missingResponse.status).toBe(404);
    expect(missingBody.error).toBe("Task not found");
  });

  it("updates metadata and status through separate routes", async () => {
    const reviewed = await createReviewedInboxItem();
    const createResponse = await convertInboxToTask(
      jsonRequest(`http://localhost/api/inbox/${reviewed.id}/convert`, {
        originInboxId: reviewed.id
      }),
      routeContext(reviewed.id)
    );
    const created = await createResponse.json();

    const patchResponse = await patchTask(
      new Request(`http://localhost/api/tasks/${created.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ownerName: "Maria",
          priority: "Alta"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }),
      routeContext(created.id)
    );
    const patched = await patchResponse.json();

    expect(patchResponse.status).toBe(200);
    expect(patched).toMatchObject({
      ownerName: "Maria",
      priority: "Alta",
      status: "Nao iniciada"
    });

    const statusResponse = await postTaskStatus(
      jsonRequest(`http://localhost/api/tasks/${created.id}/status`, {
        status: "Bloqueada",
        movementNote: "Aguardando dependencia externa"
      }),
      routeContext(created.id)
    );
    const statusBody = await statusResponse.json();

    expect(statusResponse.status).toBe(200);
    expect(statusBody).toMatchObject({
      ownerName: "Maria",
      priority: "Alta",
      status: "Bloqueada",
      origin: {
        reviewedNextAction: "Abrir tarefa com responsavel"
      }
    });
    expect(statusBody.timeline.at(-1)).toMatchObject({
      type: "status_updated",
      toStatus: "Bloqueada"
    });
  });

  it("returns 400 and 404 from the dedicated status mutation", async () => {
    const invalidEnum = await postTaskStatus(
      jsonRequest("http://localhost/api/tasks/1/status", {
        status: "Em pausa"
      }),
      routeContext(1)
    );
    expect(invalidEnum.status).toBe(400);

    const notFound = await postTaskStatus(
      jsonRequest("http://localhost/api/tasks/999/status", {
        status: "Concluida"
      }),
      routeContext(999)
    );
    const notFoundBody = await notFound.json();

    expect(notFound.status).toBe(404);
    expect(notFoundBody.error).toBe("Task not found");
  });
});
