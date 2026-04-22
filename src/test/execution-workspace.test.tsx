import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceShell } from "@/components/execution/workspace-shell";
import type {
  ReadyToConvertItem,
  TaskDetail,
  TaskListItem,
  TaskSummary
} from "@/types/tasks";

import { executionWorkspaceFixture } from "./fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/execucao"
}));

const {
  items: taskItems,
  detail: taskDetail,
  secondDetail: secondTaskDetail,
  readyToConvert,
  summary
} = executionWorkspaceFixture;

function workspacePayload(
  items: TaskListItem[] = taskItems,
  nextSummary: TaskSummary = summary,
  nextReadyToConvert: ReadyToConvertItem[] = readyToConvert
) {
  return {
    items,
    summary: nextSummary,
    readyToConvert: nextReadyToConvert
  };
}

describe("execution workspace shell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders server-hydrated tasks and filters by status and owner", () => {
    render(
      <WorkspaceShell
        initialItems={taskItems}
        initialReadyToConvert={readyToConvert}
        initialSelectedItem={taskDetail}
        initialSummary={summary}
      />
    );

    expect(screen.getAllByText("Contrato operacional").length).toBeGreaterThan(0);
    expect(screen.getByText("Checklist de onboarding")).toBeInTheDocument();
    expect(screen.getByText("Origem vinculada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Panorama" })).toHaveAttribute(
      "href",
      "/panorama"
    );

    fireEvent.change(screen.getByLabelText("Filtrar por status"), {
      target: { value: "Bloqueada" }
    });
    fireEvent.change(screen.getAllByLabelText("Responsavel")[0], {
      target: { value: "unassigned" }
    });

    expect(screen.getAllByText("Contrato operacional").length).toBeGreaterThan(0);
    expect(screen.queryByText("Checklist de onboarding")).not.toBeInTheDocument();
  });

  it("selects a task and refreshes the detail panel", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(secondTaskDetail)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceShell
        initialItems={taskItems}
        initialReadyToConvert={readyToConvert}
        initialSelectedItem={taskDetail}
        initialSummary={summary}
      />
    );

    fireEvent.click(screen.getByText(/Checklist de onboarding/));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/tasks/2")
    );
    await waitFor(() =>
      expect(screen.getByText(/Executar checklist/)).toBeInTheDocument()
    );
  });

  it("converts a ready item and refreshes the radar", async () => {
    const createdTask: TaskDetail = {
      ...secondTaskDetail,
      id: 3,
      originInboxId: 12,
      title: "Nova entrada revisada"
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(createdTask), { status: 201 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            workspacePayload(
              [...taskItems, createdTask],
              { ...summary, totalCount: 3, readyToConvertCount: 0 },
              []
            )
          )
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(createdTask)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceShell
        initialItems={taskItems}
        initialReadyToConvert={readyToConvert}
        initialSelectedItem={taskDetail}
        initialSummary={summary}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Converter em tarefa" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/inbox/12/convert",
        expect.objectContaining({ method: "POST" })
      )
    );
    await waitFor(() =>
      expect(screen.getByText("Entrada convertida em tarefa.")).toBeInTheDocument()
    );
  });

  it("updates owner, priority and status without losing origin context", async () => {
    const metaUpdated: TaskDetail = {
      ...taskDetail,
      ownerName: "Maria",
      priority: "Alta"
    };
    const statusUpdated: TaskDetail = {
      ...metaUpdated,
      status: "Em andamento",
      timeline: [
      ...metaUpdated.timeline,
      {
        type: "status_updated",
        at: taskDetail.timeline[0].at,
        note: "Responsavel iniciou execucao.",
        fromStatus: "Bloqueada",
        toStatus: "Em andamento"
      }
      ]
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(metaUpdated)))
      .mockResolvedValueOnce(new Response(JSON.stringify(workspacePayload())))
      .mockResolvedValueOnce(new Response(JSON.stringify(metaUpdated)))
      .mockResolvedValueOnce(new Response(JSON.stringify(statusUpdated)))
      .mockResolvedValueOnce(new Response(JSON.stringify(workspacePayload())))
      .mockResolvedValueOnce(new Response(JSON.stringify(statusUpdated)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceShell
        initialItems={taskItems}
        initialReadyToConvert={readyToConvert}
        initialSelectedItem={taskDetail}
        initialSummary={summary}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Nome do responsavel"), {
      target: { value: "Maria" }
    });
    fireEvent.change(screen.getByLabelText("Prioridade"), {
      target: { value: "Alta" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Atualizar responsavel" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/tasks/1",
        expect.objectContaining({ method: "PATCH" })
      )
    );
    await waitFor(() =>
      expect(screen.getByText("Responsavel e prioridade atualizados.")).toBeInTheDocument()
    );

    fireEvent.change(screen.getByLabelText("Status da tarefa"), {
      target: { value: "Em andamento" }
    });
    fireEvent.change(screen.getByLabelText("Ultima movimentacao"), {
      target: { value: "Responsavel iniciou execucao." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Atualizar status" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/tasks/1/status",
        expect.objectContaining({ method: "POST" })
      )
    );
    await waitFor(() =>
      expect(screen.getByText("Status da tarefa atualizado.")).toBeInTheDocument()
    );
    expect(screen.getByText("Origem vinculada")).toBeInTheDocument();
  });

  it("schedules an agenda item from the selected task", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 99 })));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkspaceShell
        initialItems={taskItems}
        initialReadyToConvert={readyToConvert}
        initialSelectedItem={taskDetail}
        initialSummary={summary}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Agendar prazo" }));
    fireEvent.change(screen.getByLabelText("Titulo do agendamento"), {
      target: { value: "Retomar bloqueio" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Agendar" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/agenda",
        expect.objectContaining({ method: "POST" })
      )
    );
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(String((options as RequestInit).body))).toMatchObject({
      linkedId: taskDetail.id,
      linkedType: "task",
      title: "Retomar bloqueio"
    });
    await waitFor(() =>
      expect(screen.getByText("Prazo agendado para a tarefa selecionada.")).toBeInTheDocument()
    );
  });

  it("shows the execution loading error copy in the workspace contract", () => {
    render(
      <WorkspaceShell
        initialItems={[]}
        initialReadyToConvert={[]}
        initialSelectedItem={null}
        initialSummary={{
          ...summary,
          activeCount: 0,
          readyToConvertCount: 0,
          totalCount: 0
        }}
      />
    );

    expect(
      screen.getByText(/Nenhuma tarefa em execucao ainda/)
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Nao foi possivel carregar o backlog de execucao")
    ).not.toBeInTheDocument();
  });
});
