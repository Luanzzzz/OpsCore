import React from "react";

import { StatusBlock } from "./status-block";

import type { TaskSummary } from "@/types/tasks";

type ExecutionRadarProps = {
  summary: TaskSummary;
};

export function ExecutionRadar({ summary }: ExecutionRadarProps) {
  return (
    <section className="ops-radar execution-radar">
      <header className="ops-radar__header">
        <div>
          <p className="workspace-panel__eyebrow">Radar de execucao</p>
          <h3>Gargalos do backlog de execucao</h3>
        </div>
      </header>

      <div className="ops-radar__blocks">
        <StatusBlock
          emphasis="accent"
          label="Prontos para conversao"
          value={summary.readyToConvertCount}
        />
        <StatusBlock
          emphasis="warning"
          label="Sem responsavel"
          value={summary.unassignedCount}
        />
        <StatusBlock
          emphasis="warning"
          label="Bloqueadas"
          value={summary.blockedCount}
        />
        <StatusBlock
          emphasis="accent"
          label="Criticas"
          value={summary.criticalCount}
        />
        <StatusBlock label="Envelhecidas" value={summary.agedCount} />
      </div>
    </section>
  );
}
