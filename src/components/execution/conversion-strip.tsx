"use client";

import React from "react";

import type { ReadyToConvertItem } from "@/types/tasks";

type ConversionStripProps = {
  isPending: boolean;
  items: ReadyToConvertItem[];
  onConvert: (item: ReadyToConvertItem) => void;
};

export function ConversionStrip({
  isPending,
  items,
  onConvert
}: ConversionStripProps) {
  return (
    <section className="conversion-strip" aria-label="Itens prontos para conversao">
      <div className="conversion-strip__header">
        <div>
          <p className="workspace-panel__eyebrow">Itens prontos para conversao</p>
          <h3>Converter em tarefa</h3>
        </div>
        <strong>{items.length}</strong>
      </div>

      {items.length === 0 ? (
        <p>Nenhuma entrada revisada aguarda conversao neste momento.</p>
      ) : (
        <ul className="conversion-strip__list">
          {items.map((item) => (
            <li className="conversion-strip__item" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p>
                  {item.source} · {item.summaryShort}
                </p>
                <p>
                  Proxima acao:{" "}
                  {item.reviewedNextAction ?? "Revisar proxima acao"}
                </p>
                <span className={`priority-badge priority-badge--${item.priorityReviewed.toLowerCase()}`}>
                  {item.priorityReviewed}
                </span>
              </div>
              <button
                className="button button--primary"
                disabled={isPending}
                onClick={() => onConvert(item)}
                type="button"
              >
                Converter em tarefa
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
