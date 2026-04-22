"use client";

import React, { useEffect, useState } from "react";

import type { InboxDetail, InboxPriority, InboxStatus, TriageReviewInput } from "@/types/inbox";

type TriageReviewCardProps = {
  detail: InboxDetail;
  isPending: boolean;
  onReview: (review: TriageReviewInput) => void;
  onRunTriage: () => void;
};

type ReviewFormState = {
  priorityReviewed: InboxPriority;
  reviewedCategory: string;
  reviewedNextAction: string;
  status: InboxStatus;
  waitingOnResponse: boolean;
};

function toFormState(detail: InboxDetail): ReviewFormState {
  return {
    priorityReviewed: detail.priorityReviewed,
    reviewedCategory: detail.reviewedCategory ?? detail.aiSuggestion?.category ?? "",
    reviewedNextAction:
      detail.reviewedNextAction ?? detail.aiSuggestion?.nextAction ?? "",
    status: detail.status,
    waitingOnResponse: detail.waitingOnResponse
  };
}

export function TriageReviewCard({
  detail,
  isPending,
  onReview,
  onRunTriage
}: TriageReviewCardProps) {
  const [form, setForm] = useState<ReviewFormState>(() => toFormState(detail));

  useEffect(() => {
    setForm(toFormState(detail));
  }, [detail]);

  return (
    <section className="triage-card">
      <div className="triage-card__header">
        <div>
          <p className="workspace-panel__eyebrow">Triagem assistida</p>
          <h4>Sugestao de proxima acao</h4>
        </div>
        <button
          className="button button--secondary"
          disabled={isPending}
          onClick={onRunTriage}
          type="button"
        >
          {detail.triageStatus === "pending" ? "Gerar triagem" : "Reprocessar triagem"}
        </button>
      </div>

      {detail.aiSuggestion ? (
        <div className="triage-card__suggestion">
          <p>
            <strong>Categoria sugerida:</strong> {detail.aiSuggestion.category}
          </p>
          <p>
            <strong>Urgencia sugerida:</strong> {detail.aiSuggestion.urgency}
          </p>
          <p>
            <strong>Sugestao de proxima acao:</strong> {detail.aiSuggestion.nextAction}
          </p>
          <p>
            <strong>Resumo contextual:</strong> {detail.aiSuggestion.summary}
          </p>
          <p>
            <strong>Justificativa da IA:</strong> {detail.aiSuggestion.rationale}
          </p>
        </div>
      ) : (
        <p className="triage-card__pending">
          Sugestoes estao sendo preparadas para este item.
        </p>
      )}

      <div className="triage-card__form">
        <label>
          <span>Categoria revisada</span>
          <input
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                reviewedCategory: event.target.value
              }))
            }
            value={form.reviewedCategory}
          />
        </label>

        <label>
          <span>Proxima acao revisada</span>
          <textarea
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                reviewedNextAction: event.target.value
              }))
            }
            value={form.reviewedNextAction}
          />
        </label>

        <label>
          <span>Prioridade revisada</span>
          <select
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                priorityReviewed: event.target.value as InboxPriority
              }))
            }
            value={form.priorityReviewed}
          >
            <option value="Baixa">Baixa</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Critica">Critica</option>
          </select>
        </label>

        <label>
          <span>Status</span>
          <select
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as InboxStatus
              }))
            }
            value={form.status}
          >
            <option value="Nova">Nova</option>
            <option value="Em analise">Em analise</option>
            <option value="Aguardando resposta">Aguardando resposta</option>
            <option value="Concluida/Arquivada">Concluida/Arquivada</option>
          </select>
        </label>

        <label className="triage-card__checkbox">
          <input
            checked={form.waitingOnResponse}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                waitingOnResponse: event.target.checked
              }))
            }
            type="checkbox"
          />
          <span>Aguardando resposta</span>
        </label>

        <button
          className="button button--primary"
          disabled={isPending}
          onClick={() => onReview(form)}
          type="button"
        >
          Registrar revisao
        </button>
      </div>
    </section>
  );
}
