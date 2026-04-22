import React from "react";
import { StatusBlock } from "./status-block";

import type { DashboardSummary } from "@/types/inbox";

type OpsRadarProps = {
  dashboard: DashboardSummary;
};

export function OpsRadar({ dashboard }: OpsRadarProps) {
  return (
    <section className="ops-radar">
      <header className="ops-radar__header">
        <div>
          <p className="workspace-panel__eyebrow">Radar operacional</p>
          <h3>Gargalos e pendencias reais da fila</h3>
        </div>
      </header>

      <div className="ops-radar__blocks">
        <StatusBlock emphasis="accent" label="Alta/Critica" value={dashboard.highPriorityCount} />
        <StatusBlock
          emphasis="warning"
          label="Aguardando resposta"
          value={dashboard.waitingOnResponseCount}
        />
        <StatusBlock label="Sem triagem revisada" value={dashboard.unreviewedTriageCount} />
        <StatusBlock
          label="Tempo medio sem resposta"
          value={`${dashboard.averageResponseAgeHours}h`}
        />
      </div>

      <section className="ops-radar__section">
        <h4>Entradas por status</h4>
        <ul>
          {dashboard.byStatus.map((item) => (
            <li key={item.status}>
              <span>{item.status}</span>
              <strong>{item.count}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="ops-radar__section">
        <h4>Itens mais antigos</h4>
        <ul>
          {dashboard.oldestItems.map((item) => (
            <li key={item.id}>
              <span>{item.title}</span>
              <strong>{item.ageHours}h</strong>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
