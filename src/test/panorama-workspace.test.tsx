import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntelligenceReadiness } from "@/components/panorama/intelligence-readiness";
import { MilestoneDirection } from "@/components/panorama/milestone-direction";
import { OverviewStrip } from "@/components/panorama/overview-strip";
import { SignalList } from "@/components/panorama/signal-list";
import { WorkspaceShell } from "@/components/panorama/workspace-shell";

import { panoramaWorkspaceFixture } from "./fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/panorama"
}));

const { panorama } = panoramaWorkspaceFixture;

describe("panorama workspace components", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders modules, signals, readiness and milestone options directly", () => {
    const { rerender } = render(<OverviewStrip modules={panorama.modules} />);

    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(screen.getByText("Tarefas")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();

    rerender(<SignalList signals={panorama.signals} />);
    expect(screen.getByText("Tarefas bloqueadas")).toBeInTheDocument();
    expect(screen.getByText("Agenda vencida")).toBeInTheDocument();

    rerender(
      <IntelligenceReadiness
        integration={panorama.integrationReadiness}
        intelligence={panorama.intelligenceReadiness}
      />
    );
    expect(screen.getByText("Preparo para inteligencia e canais")).toBeInTheDocument();
    expect(screen.getByText("context packet resumido")).toBeInTheDocument();
    expect(screen.getByText("politica de sincronizacao externa")).toBeInTheDocument();

    rerender(<MilestoneDirection options={panorama.nextMilestoneOptions} />);
    expect(screen.getByText("Inteligencia operacional mais forte")).toBeInTheDocument();
  });

  it("renders empty signal state without implying active integrations", () => {
    render(<SignalList signals={[]} />);

    expect(screen.getByText("Nenhum sinal de pressao agora")).toBeInTheDocument();
    expect(screen.queryByText(/conectado|sincronizado|agente ativo/i)).not.toBeInTheDocument();
  });
});

describe("panorama workspace shell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the full workspace and navigation", () => {
    render(<WorkspaceShell initialPanorama={panorama} />);

    expect(screen.getByRole("link", { name: "Inbox" })).toHaveAttribute("href", "/inbox");
    expect(screen.getByRole("link", { name: "Tarefas" })).toHaveAttribute("href", "/execucao");
    expect(screen.getByRole("link", { name: "Agenda" })).toHaveAttribute("href", "/agenda");
    expect(screen.getByRole("link", { name: "Panorama" })).toHaveAttribute("href", "/panorama");
    expect(screen.getByText("Estado amplo da operacao a partir dos workspaces reais")).toBeInTheDocument();
    expect(screen.getByText("Tarefas bloqueadas")).toBeInTheDocument();
  });

  it("refreshes through the panorama API only", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ...panorama,
          modules: panorama.modules.map((module) =>
            module.id === "inbox" ? { ...module, pressureCount: 4 } : module
          )
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<WorkspaceShell initialPanorama={panorama} />);

    fireEvent.click(screen.getByRole("button", { name: "Atualizar panorama" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/panorama"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByText("Panorama atualizado a partir dos estados atuais.")).toBeInTheDocument()
    );
  });

  it("shows a short refresh error", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("{}", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    render(<WorkspaceShell initialPanorama={panorama} />);

    fireEvent.click(screen.getByRole("button", { name: "Atualizar panorama" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Nao foi possivel atualizar o panorama"
      )
    );
  });
});
