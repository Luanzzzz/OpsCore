import React from "react";

import type {
  IntegrationReadinessSnapshot,
  IntelligenceReadinessSnapshot
} from "@/types/panorama";

type IntelligenceReadinessProps = {
  intelligence: IntelligenceReadinessSnapshot;
  integration: IntegrationReadinessSnapshot;
};

function ReadinessColumn({
  available,
  missing,
  title
}: {
  available: string[];
  missing: string[];
  title: string;
}) {
  return (
    <div className="panorama-readiness__column">
      <h4>{title}</h4>
      <div>
        <strong>Base disponivel</strong>
        <ul>
          {available.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Sinais ausentes</strong>
        <ul>
          {missing.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function IntelligenceReadiness({
  intelligence,
  integration
}: IntelligenceReadinessProps) {
  return (
    <section className="panorama-panel panorama-readiness">
      <p className="workspace-panel__eyebrow">Readiness</p>
      <h3>Preparo para inteligencia e canais</h3>
      <ReadinessColumn
        available={intelligence.availableSignals}
        missing={intelligence.missingSignals}
        title="Inteligencia"
      />
      <ReadinessColumn
        available={integration.availableSignals}
        missing={integration.missingSignals}
        title="Integracoes"
      />
    </section>
  );
}
