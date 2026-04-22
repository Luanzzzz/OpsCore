import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceShell } from "@/components/agenda/workspace-shell";
import { ItemDetailPanel } from "@/components/detail/item-detail-panel";
import type {
  AgendaDetail,
  AgendaListItem,
  AgendaSummary
} from "@/types/agenda";

import { agendaWorkspaceFixture } from "./fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/agenda"
}));

const {
  items: agendaItems,
  detail: agendaDetail,
  secondDetail: secondAgendaDetail,
  summary,
  inboxDetail
} = agendaWorkspaceFixture;

function workspacePayload(
  items: AgendaListItem[] = agendaItems,
  nextSummary: AgendaSummary = summary
) {
  return { items, summary: nextSummary };
}

describe("agenda workspace shell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders server-hydrated agenda, radar and detail", () => {
    render(
      <WorkspaceShell
        initialItems={agendaItems}
        initialSelectedItem={agendaDetail}
        initialSummary={summary}
      />
    );

    expect(screen.getByText("Agenda operacional")).toBeInTheDocument();
    expect(screen.getAllByText("Retomar contrato").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Enviar proposta").length).toBeGreaterThan(0);
    expect(screen.getByText("Prazos criticos do fluxo operacional")).toBeInTheDocument();
    expect(screen.getByText("Origem vinculada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Panorama" })).toHaveAttribute(
      "href",
      "/panorama"
    );
  });

  it("filters by temporal state through the agenda API", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(workspacePayload([agendaItems[1]])))
      );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceShell
        initialItems={agendaItems}
        initialSelectedItem={agendaDetail}
        initialSummary={summary}
      />
    );

    fireEvent.change(screen.getByLabelText("Filtrar agenda por estado temporal"), {
      target: { value: "vencido" }
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/agenda?sort=urgency&urgencyState=vencido"
      )
    );
    await waitFor(() =>
      expect(screen.getAllByText("Enviar proposta").length).toBeGreaterThan(0)
    );
  });

  it("selects agenda items and fetches detail", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(secondAgendaDetail)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceShell
        initialItems={agendaItems}
        initialSelectedItem={agendaDetail}
        initialSummary={summary}
      />
    );

    fireEvent.click(screen.getAllByText("Enviar proposta")[0]);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/agenda/2")
    );
    await waitFor(() =>
      expect(screen.getByText("Cliente pediu proposta.")).toBeInTheDocument()
    );
  });

  it("reschedules agenda items", async () => {
    const rescheduled: AgendaDetail = {
      ...agendaDetail,
      dueAt: "2026-04-24T18:00:00.000Z",
      title: "Retomar contrato atualizado"
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(rescheduled)))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(workspacePayload()))
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(rescheduled)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceShell
        initialItems={agendaItems}
        initialSelectedItem={agendaDetail}
        initialSummary={summary}
      />
    );

    fireEvent.change(screen.getByLabelText("Titulo"), {
      target: { value: "Retomar contrato atualizado" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Reagendar" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/agenda/1",
        expect.objectContaining({ method: "PATCH" })
      )
    );
    await waitFor(() =>
      expect(screen.getByText("Item de agenda reagendado.")).toBeInTheDocument()
    );
  });

  it("concludes agenda items", async () => {
    const completed: AgendaDetail = {
      ...agendaDetail,
      status: "Concluido",
      urgencyState: "futuro",
      completedAt: agendaDetail.timeline[0].at,
      timeline: [
        ...agendaDetail.timeline,
        {
          type: "completed",
          at: agendaDetail.timeline[0].at,
          note: "Fechado.",
          fromStatus: "Aberto",
          toStatus: "Concluido"
        }
      ]
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(completed)))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            workspacePayload(agendaItems, {
              ...summary,
              activeCount: 1,
              completedCount: 1
            })
          )
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(completed)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceShell
        initialItems={agendaItems}
        initialSelectedItem={agendaDetail}
        initialSummary={summary}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Concluir" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/agenda/1/status",
        expect.objectContaining({ method: "POST" })
      )
    );
  });

  it("schedules an agenda item from inbox detail", async () => {
    const onSchedule = vi.fn();
    render(
      <ItemDetailPanel
        detail={inboxDetail}
        isPending={false}
        onReview={vi.fn()}
        onRunTriage={vi.fn()}
        onSchedule={onSchedule}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Agendar follow-up" }));

    expect(onSchedule).toHaveBeenCalledTimes(1);
  });
});
