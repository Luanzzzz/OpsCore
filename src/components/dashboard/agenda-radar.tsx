import React from "react";

import { StatusBlock } from "./status-block";

import type { AgendaSummary } from "@/types/agenda";

type AgendaRadarProps = {
  summary: AgendaSummary;
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function AgendaRadar({ summary }: AgendaRadarProps) {
  return (
    <section className="ops-radar agenda-radar">
      <header className="ops-radar__header">
        <div>
          <p className="workspace-panel__eyebrow">Radar da agenda</p>
          <h3>Prazos criticos do fluxo operacional</h3>
        </div>
      </header>

      <div className="ops-radar__blocks">
        <StatusBlock
          emphasis="warning"
          label="Vencidos"
          value={summary.overdueCount}
        />
        <StatusBlock
          emphasis="accent"
          label="Hoje"
          value={summary.dueTodayCount}
        />
        <StatusBlock label="Proximos" value={summary.upcomingCount} />
        <StatusBlock label="Abertos" value={summary.activeCount} />
      </div>

      <section className="ops-radar__section">
        <h4>Criticos</h4>
        {summary.criticalItems.length === 0 ? (
          <p>Nenhum prazo critico aberto.</p>
        ) : (
          <ul>
            {summary.criticalItems.map((item) => (
              <li key={item.id}>
                <span>{item.title}</span>
                <strong>{formatDateLabel(item.dueAt)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
