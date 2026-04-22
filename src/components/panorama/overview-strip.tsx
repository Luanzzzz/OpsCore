import React from "react";

import { StatusBlock } from "@/components/dashboard/status-block";
import type { PanoramaModuleState } from "@/types/panorama";

type OverviewStripProps = {
  modules: PanoramaModuleState[];
};

export function OverviewStrip({ modules }: OverviewStripProps) {
  return (
    <section className="panorama-overview" aria-label="Resumo dos modulos">
      {modules.map((module) => (
        <article className="panorama-module" key={module.id}>
          <div>
            <p className="workspace-panel__eyebrow">{module.label}</p>
            <h3>{module.summary}</h3>
          </div>
          <div className="panorama-module__blocks">
            <StatusBlock label="Total" value={module.totalCount} />
            <StatusBlock label="Ativos" value={module.activeCount} />
            <StatusBlock
              emphasis={module.pressureCount > 0 ? "warning" : "default"}
              label="Pressao"
              value={module.pressureCount}
            />
          </div>
        </article>
      ))}
    </section>
  );
}
