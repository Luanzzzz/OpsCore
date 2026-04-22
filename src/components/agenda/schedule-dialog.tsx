"use client";

import React, { useEffect, useState } from "react";

import type { AgendaKind } from "@/types/agenda";

export type ScheduleDialogInput = {
  dueAt: string;
  kind: AgendaKind;
  notes: string | null;
  ownerName: string | null;
  title: string;
};

type ScheduleDialogProps = {
  isOpen: boolean;
  isPending: boolean;
  linkedLabel: string;
  onClose: () => void;
  onSubmit: (input: ScheduleDialogInput) => void;
  suggestedOwner?: string | null;
  suggestedTitle: string;
};

const INITIAL_KIND: AgendaKind = "follow_up";

function defaultDueAt() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString();
}

export function ScheduleDialog({
  isOpen,
  isPending,
  linkedLabel,
  onClose,
  onSubmit,
  suggestedOwner,
  suggestedTitle
}: ScheduleDialogProps) {
  const [kind, setKind] = useState<AgendaKind>(INITIAL_KIND);
  const [title, setTitle] = useState(suggestedTitle);
  const [dueAt, setDueAt] = useState(defaultDueAt());
  const [ownerName, setOwnerName] = useState(suggestedOwner ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setKind(INITIAL_KIND);
      setTitle(suggestedTitle);
      setDueAt(defaultDueAt());
      setOwnerName(suggestedOwner ?? "");
      setNotes("");
      setError(null);
    }
  }, [isOpen, suggestedOwner, suggestedTitle]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit() {
    if (!title.trim() || !dueAt) {
      setError("Preencha titulo e vencimento.");
      return;
    }

    onSubmit({
      dueAt: fromDateTimeLocal(dueAt),
      kind,
      notes: notes.trim() || null,
      ownerName: ownerName.trim() || null,
      title: title.trim()
    });
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        aria-labelledby="schedule-dialog-title"
        className="dialog-panel schedule-dialog"
        role="dialog"
      >
        <header className="dialog-panel__header">
          <div>
            <p className="workspace-panel__eyebrow">Agenda</p>
            <h3 id="schedule-dialog-title">Agendar follow-up</h3>
          </div>
          <button
            className="button button--ghost"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </header>

        <div className="dialog-panel__body">
          <p>{linkedLabel}</p>

          {error ? (
            <p className="workspace-inline-error" role="alert">
              {error}
            </p>
          ) : null}

          <label>
            <span>Tipo</span>
            <select
              aria-label="Tipo de agenda"
              onChange={(event) => setKind(event.target.value as AgendaKind)}
              value={kind}
            >
              <option value="follow_up">Follow-up</option>
              <option value="deadline">Prazo</option>
              <option value="commitment">Compromisso</option>
            </select>
          </label>

          <label>
            <span>Titulo</span>
            <input
              aria-label="Titulo do agendamento"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </label>

          <label>
            <span>Vencimento</span>
            <input
              aria-label="Vencimento do agendamento"
              onChange={(event) => setDueAt(event.target.value)}
              type="datetime-local"
              value={dueAt}
            />
          </label>

          <label>
            <span>Responsavel</span>
            <input
              aria-label="Responsavel pelo agendamento"
              onChange={(event) => setOwnerName(event.target.value)}
              placeholder="Nome do responsavel"
              value={ownerName}
            />
          </label>

          <label>
            <span>Notas</span>
            <textarea
              aria-label="Notas do agendamento"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Contexto do prazo ou follow-up"
              value={notes}
            />
          </label>
        </div>

        <footer className="dialog-panel__footer">
          <button className="button button--ghost" onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className="button button--primary"
            disabled={isPending}
            onClick={handleSubmit}
            type="button"
          >
            Agendar
          </button>
        </footer>
      </section>
    </div>
  );
}
