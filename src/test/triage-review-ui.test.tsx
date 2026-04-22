import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TriageReviewCard } from "@/components/detail/triage-review-card";
import type { InboxDetail } from "@/types/inbox";

const pendingDetail: InboxDetail = {
  id: 1,
  title: "Cliente aguardando resposta",
  source: "WhatsApp",
  summaryShort: "Pedir retorno hoje",
  status: "Nova",
  priorityReviewed: "Media",
  waitingOnResponse: false,
  lastActivityAt: "2026-04-18T12:00:00.000Z",
  triageStatus: "pending",
  descriptionRaw: "Cliente pediu retorno hoje",
  aiSuggestion: null,
  reviewedCategory: null,
  reviewedNextAction: null,
  triageReviewedAt: null
};

describe("triage review card", () => {
  it("shows the pending state and allows running triage", () => {
    const onRunTriage = vi.fn();

    render(
      <TriageReviewCard
        detail={pendingDetail}
        isPending={false}
        onReview={vi.fn()}
        onRunTriage={onRunTriage}
      />
    );

    expect(
      screen.getByText("Sugestoes estao sendo preparadas para este item.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Gerar triagem" }));

    expect(onRunTriage).toHaveBeenCalledTimes(1);
  });

  it("renders AI suggestion fields and submits the reviewed state", () => {
    const onReview = vi.fn();

    render(
      <TriageReviewCard
        detail={{
          ...pendingDetail,
          aiSuggestion: {
            category: "Comercial",
            urgency: "Critica",
            nextAction: "Responder cliente ainda hoje",
            summary: "Cliente pressiona por retorno",
            rationale: "Urgencia comercial explicita."
          },
          triageStatus: "ready"
        }}
        isPending={false}
        onReview={onReview}
        onRunTriage={vi.fn()}
      />
    );

    expect(screen.getByText(/Categoria sugerida:/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Categoria revisada"), {
      target: { value: "Comercial VIP" }
    });
    fireEvent.change(screen.getByLabelText("Proxima acao revisada"), {
      target: { value: "Responder agora" }
    });
    fireEvent.change(screen.getByLabelText("Prioridade revisada"), {
      target: { value: "Critica" }
    });
    fireEvent.click(screen.getByLabelText("Aguardando resposta"));
    fireEvent.click(screen.getByRole("button", { name: "Registrar revisao" }));

    expect(onReview).toHaveBeenCalledWith(
      expect.objectContaining({
        reviewedCategory: "Comercial VIP",
        reviewedNextAction: "Responder agora",
        priorityReviewed: "Critica",
        waitingOnResponse: true
      })
    );
  });
});
