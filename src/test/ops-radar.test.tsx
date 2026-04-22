import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OpsRadar } from "@/components/dashboard/ops-radar";

describe("ops radar", () => {
  it("renders the required operational blocks and oldest items", () => {
    render(
      <OpsRadar
        dashboard={{
          byStatus: [
            { status: "Nova", count: 2 },
            { status: "Em analise", count: 1 },
            { status: "Aguardando resposta", count: 3 },
            { status: "Concluida/Arquivada", count: 0 }
          ],
          highPriorityCount: 4,
          waitingOnResponseCount: 3,
          unreviewedTriageCount: 2,
          oldestItems: [
            { id: 1, title: "Cliente parado", ageHours: 9 },
            { id: 2, title: "Prazo vencendo", ageHours: 5 }
          ],
          averageResponseAgeHours: 6
        }}
      />
    );

    expect(screen.getByText("Alta/Critica")).toBeInTheDocument();
    expect(screen.getAllByText("Aguardando resposta").length).toBeGreaterThan(0);
    expect(screen.getByText("Sem triagem revisada")).toBeInTheDocument();
    expect(screen.getByText("Cliente parado")).toBeInTheDocument();
    expect(screen.getByText("Prazo vencendo")).toBeInTheDocument();
    expect(screen.getByText("6h")).toBeInTheDocument();
  });
});
