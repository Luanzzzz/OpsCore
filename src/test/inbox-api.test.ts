import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { GET as getInboxDetail } from "@/app/api/inbox/[id]/route";
import { GET as getInboxList, POST as postInbox } from "@/app/api/inbox/route";
import { resetInboxStore } from "@/db/queries/inbox";

describe("inbox api", () => {
  beforeEach(async () => {
    await resetInboxStore();
  });

  it("creates an inbox item with default operational fields", async () => {
    const response = await postInbox(
      new Request("http://localhost/api/inbox", {
        method: "POST",
        body: JSON.stringify({
          title: "Lead aguardando triagem",
          source: "manual",
          summaryShort: "Pedido chegou pelo time comercial."
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }) as never
    );

    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.priorityReviewed).toBe("Media");
    expect(body.status).toBe("Nova");
    expect(body.triageStatus).toBe("pending");
  });

  it("lists and details real inbox data", async () => {
    await postInbox(
      new Request("http://localhost/api/inbox", {
        method: "POST",
        body: JSON.stringify({
          title: "Mensagem de WhatsApp",
          source: "whatsapp",
          summaryShort: "Cliente pediu retorno ainda hoje.",
          priorityReviewed: "Critica"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }) as never
    );

    const listResponse = await getInboxList(
      new NextRequest("http://localhost/api/inbox")
    );
    const listBody = await listResponse.json();

    expect(listBody.items).toHaveLength(1);
    expect(listBody.items[0].title).toBe("Mensagem de WhatsApp");

    const detailResponse = await getInboxDetail({} as Request, {
      params: Promise.resolve({ id: String(listBody.items[0].id) })
    });
    const detailBody = await detailResponse.json();

    expect(detailBody.descriptionRaw).toContain("Cliente pediu retorno");
    expect(detailBody.triageStatus).toBe("pending");
  });
});
