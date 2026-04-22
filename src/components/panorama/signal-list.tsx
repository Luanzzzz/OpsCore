import Link from "next/link";
import React from "react";

import type { PanoramaSignal } from "@/types/panorama";

type SignalListProps = {
  signals: PanoramaSignal[];
};

const SEVERITY_LABEL = {
  critical: "Critico",
  warning: "Atencao",
  info: "Sinal"
} as const;

export function SignalList({ signals }: SignalListProps) {
  if (signals.length === 0) {
    return (
      <section className="panorama-panel">
        <p className="workspace-panel__eyebrow">Sinais</p>
        <h3>Nenhum sinal de pressao agora</h3>
        <p>Inbox, tarefas e agenda nao indicam bloqueios consolidados.</p>
      </section>
    );
  }

  return (
    <section className="panorama-panel">
      <p className="workspace-panel__eyebrow">Sinais</p>
      <h3>Pressao operacional consolidada</h3>
      <ul className="panorama-signal-list">
        {signals.map((signal) => (
          <li className={`panorama-signal panorama-signal--${signal.severity}`} key={signal.id}>
            <div>
              <span>{SEVERITY_LABEL[signal.severity]}</span>
              <strong>{signal.title}</strong>
              <p>{signal.detail}</p>
            </div>
            <Link href={signal.targetRoute}>Abrir</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
