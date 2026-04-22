"use client";

import React, { useEffect, useState } from "react";

import type { CreateInboxInput } from "@/types/inbox";

type NewEntryDialogProps = {
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: CreateInboxInput) => void;
};

const INITIAL_FORM: CreateInboxInput = {
  title: "",
  source: "",
  summaryShort: "",
  descriptionRaw: ""
};

export function NewEntryDialog({
  isOpen,
  isPending,
  onClose,
  onSubmit
}: NewEntryDialogProps) {
  const [form, setForm] = useState<CreateInboxInput>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleField<K extends keyof CreateInboxInput>(
    key: K,
    value: CreateInboxInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.source.trim() || !form.summaryShort.trim()) {
      setError("Preencha titulo, origem e resumo curto para registrar a entrada.");
      return;
    }

    onSubmit({
      ...form,
      title: form.title.trim(),
      source: form.source.trim(),
      summaryShort: form.summaryShort.trim(),
      descriptionRaw: form.descriptionRaw?.trim() || form.summaryShort.trim()
    });
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section aria-modal="true" className="dialog-panel" role="dialog">
        <div className="dialog-panel__header">
          <div>
            <p className="workspace-panel__eyebrow">Nova entrada</p>
            <h3>Registrar entrada</h3>
          </div>
          <button
            aria-label="Fechar formulario"
            className="button button--ghost"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>

        <div className="dialog-panel__body">
          <label>
            <span>Titulo</span>
            <input
              onChange={(event) => handleField("title", event.target.value)}
              value={form.title}
            />
          </label>

          <label>
            <span>Origem</span>
            <input
              onChange={(event) => handleField("source", event.target.value)}
              value={form.source}
            />
          </label>

          <label>
            <span>Resumo curto</span>
            <textarea
              onChange={(event) => handleField("summaryShort", event.target.value)}
              value={form.summaryShort}
            />
          </label>

          <label>
            <span>Contexto bruto</span>
            <textarea
              onChange={(event) => handleField("descriptionRaw", event.target.value)}
              value={form.descriptionRaw}
            />
          </label>

          {error ? (
            <p className="workspace-inline-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="dialog-panel__footer">
          <button className="button button--secondary" onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className="button button--primary"
            disabled={isPending}
            onClick={handleSubmit}
            type="button"
          >
            Registrar entrada
          </button>
        </div>
      </section>
    </div>
  );
}
