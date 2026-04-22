"use client";

import React, { useEffect, useState } from "react";

import type {
  AgendaDetail,
  AgendaKind,
  UpdateAgendaItemInput,
  UpdateAgendaStatusInput
} from "@/types/agenda";

type AgendaDetailPanelProps = {
  detail: AgendaDetail | null;
  isPending: boolean;
  onUpdateItem: (input: UpdateAgendaItemInput) => void;
  onUpdateStatus: (input: UpdateAgendaStatusInput) => void;
};

const KINDS: Array<{ label: string; value: AgendaKind }> = [
  { label: "Follow-up", value: "follow_up" },
  { label: "Prazo", value: "deadline" },
  { label: "Compromisso", value: "commitment" }
];

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString();
}

function kindLabel(kind: AgendaKind) {
  return KINDS.find((item) => item.value === kind)?.label ?? kind;
}

function urgencyLabel(state: AgendaDetail["urgencyState"]) {
  const labels = {
    futuro: "Futuro",
    hoje: "Hoje",
    proximo: "Proximo",
    vencido: "Vencido"
  };

  return labels[state];
}

export function AgendaDetailPanel({
  detail,
  isPending,
  onUpdateItem,
  onUpdateStatus
}: AgendaDetailPanelProps) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<AgendaKind>("follow_up");
  const [dueAt, setDueAt] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [notes, setNotes] = useState("");
  const [movementNote, setMovementNote] = useState("");

  useEffect(() => {
    setTitle(detail?.title ?? "");
    setKind(detail?.kind ?? "follow_up");
    setDueAt(detail ? toDateTimeLocal(detail.dueAt) : "");
    setOwnerName(detail?.ownerName ?? "");
    setNotes(detail?.notes ?? "");
    setMovementNote("");
  }, [detail]);

  if (!detail) {
    return (
      <section className="detail-panel agenda-detail">
        <p className="workspace-panel__eyebrow">Detalhe da agenda</p>
        <h3>Selecione um vencimento</h3>
        <p>
          O painel lateral mostra origem vinculada, status temporal e acoes de
          conclusao ou reagendamento assim que um item for selecionado.
        </p>
      </section>
    );
  }

  const isClosed = detail.status !== "Aberto";

  return (
    <section className="detail-panel agenda-detail">
      <header className="detail-panel__header">
        <div>
          <p className="workspace-panel__eyebrow">Detalhe da agenda</p>
          <h3>{detail.title}</h3>
        </div>
        <span className={`status-chip agenda-urgency agenda-urgency--${detail.urgencyState}`}>
          {urgencyLabel(detail.urgencyState)}
        </span>
      </header>

      <dl className="detail-panel__meta">
        <div>
          <dt>Tipo</dt>
          <dd>{kindLabel(detail.kind)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{detail.status}</dd>
        </div>
        <div>
          <dt>Vencimento</dt>
          <dd>{formatDateLabel(detail.dueAt)}</dd>
        </div>
        <div>
          <dt>Responsavel</dt>
          <dd>{detail.ownerName ?? "Sem responsavel"}</dd>
        </div>
      </dl>

      <section className="task-detail__origin agenda-detail__origin">
        <h4>Origem vinculada</h4>
        <p>
          <strong>{detail.originSnapshot.title}</strong> ·{" "}
          {detail.originSnapshot.sourceLabel}
        </p>
        <p>{detail.originSnapshot.summary}</p>
        <p>
          {detail.originSnapshot.linkedType === "task" ? "Tarefa" : "Inbox"} ·{" "}
          {detail.originSnapshot.statusLabel}
        </p>
      </section>

      <section className="task-detail__form agenda-detail__form">
        <h4>Reagendar</h4>
        <label>
          <span>Titulo</span>
          <input
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
        </label>

        <label>
          <span>Tipo</span>
          <select
            onChange={(event) => setKind(event.target.value as AgendaKind)}
            value={kind}
          >
            {KINDS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Vencimento</span>
          <input
            onChange={(event) => setDueAt(event.target.value)}
            type="datetime-local"
            value={dueAt}
          />
        </label>

        <label>
          <span>Responsavel</span>
          <input
            onChange={(event) => setOwnerName(event.target.value)}
            placeholder="Nome do responsavel"
            value={ownerName}
          />
        </label>

        <label>
          <span>Notas</span>
          <textarea
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Contexto do prazo ou follow-up"
            value={notes}
          />
        </label>

        <button
          className="button button--secondary"
          disabled={isPending || isClosed || !dueAt}
          onClick={() =>
            onUpdateItem({
              dueAt: fromDateTimeLocal(dueAt),
              kind,
              notes: notes.trim() || null,
              ownerName: ownerName.trim() || null,
              title: title.trim()
            })
          }
          type="button"
        >
          Reagendar
        </button>
      </section>

      <section className="task-detail__form agenda-detail__form">
        <h4>Acoes</h4>
        <label>
          <span>Nota da movimentacao</span>
          <textarea
            onChange={(event) => setMovementNote(event.target.value)}
            placeholder="Descreva a conclusao ou cancelamento"
            value={movementNote}
          />
        </label>

        <div className="agenda-detail__actions">
          <button
            className="button button--primary"
            disabled={isPending || isClosed}
            onClick={() =>
              onUpdateStatus({
                movementNote: movementNote.trim() || null,
                status: "Concluido"
              })
            }
            type="button"
          >
            Concluir
          </button>
          <button
            className="button button--ghost"
            disabled={isPending || isClosed}
            onClick={() =>
              onUpdateStatus({
                movementNote: movementNote.trim() || null,
                status: "Cancelado"
              })
            }
            type="button"
          >
            Cancelar
          </button>
        </div>
      </section>

      <section className="task-detail__timeline">
        <h4>Historico operacional</h4>
        <ul>
          {detail.timeline.map((event) => (
            <li key={`${event.type}-${event.at}`}>
              <strong>{event.type}</strong>
              <span>{formatDateLabel(event.at)}</span>
              <p>{event.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
