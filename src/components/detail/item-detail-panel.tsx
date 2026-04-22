"use client";

import React from "react";
import { TriageReviewCard } from "./triage-review-card";

import type { InboxDetail, TriageReviewInput } from "@/types/inbox";

type ItemDetailPanelProps = {
  detail: InboxDetail | null;
  isPending: boolean;
  onReview: (review: TriageReviewInput) => void;
  onRunTriage: () => void;
  onSchedule?: () => void;
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ItemDetailPanel({
  detail,
  isPending,
  onReview,
  onRunTriage,
  onSchedule
}: ItemDetailPanelProps) {
  if (!detail) {
    return (
      <section className="detail-panel">
        <p className="workspace-panel__eyebrow">Detalhe</p>
        <h3>Selecione uma entrada</h3>
        <p>
          O painel lateral mostra contexto, sugestoes de IA e os proximos passos
          do item ativo.
        </p>
      </section>
    );
  }

  return (
    <section className="detail-panel">
      <header className="detail-panel__header">
        <div>
          <p className="workspace-panel__eyebrow">Detalhe do item</p>
          <h3>{detail.title}</h3>
        </div>
        <span className="status-chip">{detail.status}</span>
      </header>

      <dl className="detail-panel__meta">
        <div>
          <dt>Origem</dt>
          <dd>{detail.source}</dd>
        </div>
        <div>
          <dt>Ultima atividade</dt>
          <dd>{formatDateLabel(detail.lastActivityAt)}</dd>
        </div>
        <div>
          <dt>Resumo contextual</dt>
          <dd>{detail.summaryShort}</dd>
        </div>
      </dl>

      <section className="detail-panel__section">
        <h4>Contexto bruto</h4>
        <p>{detail.descriptionRaw}</p>
      </section>

      {onSchedule ? (
        <button
          className="button button--secondary"
          disabled={isPending}
          onClick={onSchedule}
          type="button"
        >
          Agendar follow-up
        </button>
      ) : null}

      <TriageReviewCard
        detail={detail}
        isPending={isPending}
        onReview={onReview}
        onRunTriage={onRunTriage}
      />
    </section>
  );
}
