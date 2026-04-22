"use client";

import React, { useEffect, useState } from "react";

import type {
  TaskDetail,
  TaskPriority,
  TaskStatus,
  UpdateTaskMetaInput,
  UpdateTaskStatusInput
} from "@/types/tasks";

type TaskDetailPanelProps = {
  detail: TaskDetail | null;
  isPending: boolean;
  onSchedule?: () => void;
  onUpdateMeta: (input: UpdateTaskMetaInput) => void;
  onUpdateStatus: (input: UpdateTaskStatusInput) => void;
};

const PRIORITIES: TaskPriority[] = ["Baixa", "Media", "Alta", "Critica"];
const STATUSES: TaskStatus[] = [
  "Nao iniciada",
  "Em andamento",
  "Bloqueada",
  "Concluida"
];

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function TaskDetailPanel({
  detail,
  isPending,
  onSchedule,
  onUpdateMeta,
  onUpdateStatus
}: TaskDetailPanelProps) {
  const [ownerName, setOwnerName] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Media");
  const [status, setStatus] = useState<TaskStatus>("Nao iniciada");
  const [movementNote, setMovementNote] = useState("");

  useEffect(() => {
    setOwnerName(detail?.ownerName ?? "");
    setPriority(detail?.priority ?? "Media");
    setStatus(detail?.status ?? "Nao iniciada");
    setMovementNote("");
  }, [detail]);

  if (!detail) {
    return (
      <section className="detail-panel task-detail">
        <p className="workspace-panel__eyebrow">Detalhe da tarefa</p>
        <h3>Selecione uma tarefa</h3>
        <p>
          O painel lateral mostra Responsavel, Status da tarefa e Origem
          vinculada assim que uma tarefa for selecionada.
        </p>
      </section>
    );
  }

  return (
    <section className="detail-panel task-detail">
      <header className="detail-panel__header">
        <div>
          <p className="workspace-panel__eyebrow">Detalhe da tarefa</p>
          <h3>{detail.title}</h3>
        </div>
        <span className="status-chip">{detail.status}</span>
      </header>

      <dl className="detail-panel__meta">
        <div>
          <dt>Responsavel</dt>
          <dd>{detail.ownerName ?? "Sem responsavel"}</dd>
        </div>
        <div>
          <dt>Prioridade</dt>
          <dd>{detail.priority}</dd>
        </div>
        <div>
          <dt>Status da tarefa</dt>
          <dd>{detail.status}</dd>
        </div>
        <div>
          <dt>Ultima movimentacao</dt>
          <dd>{formatDateLabel(detail.lastMovementAt)}</dd>
        </div>
      </dl>

      <section className="task-detail__origin">
        <h4>Origem vinculada</h4>
        <p>
          <strong>{detail.origin.title}</strong> · {detail.origin.source}
        </p>
        <p>{detail.origin.summaryShort}</p>
        <p>
          Proxima acao revisada:{" "}
          {detail.origin.reviewedNextAction ?? "Nao informada"}
        </p>
      </section>

      {onSchedule ? (
        <button
          className="button button--secondary"
          disabled={isPending}
          onClick={onSchedule}
          type="button"
        >
          Agendar prazo
        </button>
      ) : null}

      <section className="task-detail__form">
        <h4>Ownership</h4>
        <label>
          <span>Responsavel</span>
          <input
            onChange={(event) => setOwnerName(event.target.value)}
            placeholder="Nome do responsavel"
            value={ownerName}
          />
        </label>

        <label>
          <span>Prioridade</span>
          <select
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
            value={priority}
          >
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button
          className="button button--secondary"
          disabled={isPending}
          onClick={() =>
            onUpdateMeta({
              ownerName: ownerName.trim() || null,
              priority
            })
          }
          type="button"
        >
          Atualizar responsavel
        </button>
      </section>

      <section className="task-detail__form">
        <h4>Progresso</h4>
        <label>
          <span>Status da tarefa</span>
          <select
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
            value={status}
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Ultima movimentacao</span>
          <textarea
            onChange={(event) => setMovementNote(event.target.value)}
            placeholder="Descreva a movimentacao mais recente"
            value={movementNote}
          />
        </label>

        <button
          className="button button--primary"
          disabled={isPending}
          onClick={() =>
            onUpdateStatus({
              status,
              movementNote: movementNote.trim() || null
            })
          }
          type="button"
        >
          Atualizar status
        </button>
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
