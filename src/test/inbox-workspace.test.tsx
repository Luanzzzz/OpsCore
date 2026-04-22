import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceShell } from "@/components/inbox/workspace-shell";

import { inboxWorkspaceFixture } from "./fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/inbox"
}));

const { items: inboxItems, detail: inboxDetail, dashboard } = inboxWorkspaceFixture;

describe("workspace shell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the dense inbox table and filters rows by status", () => {
    render(
      <WorkspaceShell
        initialDashboard={dashboard}
        initialItems={inboxItems}
        initialSelectedItem={inboxDetail}
      />
    );

    expect(screen.getAllByText("Cliente aguardando resposta").length).toBeGreaterThan(0);
    expect(screen.getByText("Follow-up interno")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Panorama" })).toHaveAttribute(
      "href",
      "/panorama"
    );

    fireEvent.change(screen.getByLabelText("Filtrar por status"), {
      target: { value: "Aguardando resposta" }
    });

    expect(screen.getAllByText("Cliente aguardando resposta").length).toBeGreaterThan(0);
    expect(screen.queryByText("Follow-up interno")).not.toBeInTheDocument();
  });

  it("opens the new entry dialog and posts the new item", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...inboxDetail,
            id: 3,
            title: "Nova captura",
            source: "Ligacao",
            summaryShort: "Confirmar proposta",
            descriptionRaw: "Confirmar proposta comercial ainda hoje."
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              ...inboxItems,
                {
                  id: 3,
                  title: "Nova captura",
                  source: "Ligacao",
                  summaryShort: "Confirmar proposta",
                  status: "Nova",
                  priorityReviewed: "Media",
                  waitingOnResponse: false,
                lastActivityAt: inboxDetail.lastActivityAt,
                  triageStatus: "pending"
                }
              ]
            })
          )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(dashboard)))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...inboxDetail,
            id: 3,
            title: "Nova captura",
            source: "Ligacao",
            summaryShort: "Confirmar proposta",
            descriptionRaw: "Confirmar proposta comercial ainda hoje.",
            status: "Nova",
            priorityReviewed: "Media",
            waitingOnResponse: false,
            triageStatus: "pending"
          })
        )
      );

    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceShell
        initialDashboard={dashboard}
        initialItems={inboxItems}
        initialSelectedItem={inboxDetail}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Registrar entrada" }));
    fireEvent.change(screen.getByLabelText("Titulo"), {
      target: { value: "Nova captura" }
    });
    fireEvent.change(screen.getByLabelText("Origem"), {
      target: { value: "Ligacao" }
    });
    fireEvent.change(screen.getByLabelText("Resumo curto"), {
      target: { value: "Confirmar proposta" }
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Registrar entrada" })[1]);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/inbox",
        expect.objectContaining({ method: "POST" })
      )
    );
    await waitFor(() =>
      expect(screen.getByText("Entrada registrada na fila operacional.")).toBeInTheDocument()
    );
  });
});
