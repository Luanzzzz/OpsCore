import React from "react";

import type { NextMilestoneOption } from "@/types/panorama";

type MilestoneDirectionProps = {
  options: NextMilestoneOption[];
};

export function MilestoneDirection({ options }: MilestoneDirectionProps) {
  return (
    <section className="panorama-panel">
      <p className="workspace-panel__eyebrow">Proxima milestone</p>
      <h3>Direcoes comparaveis</h3>
      <ul className="panorama-milestone-list">
        {options.map((option) => (
          <li key={option.id}>
            <div>
              <strong>{option.title}</strong>
              <span>Readiness: {option.readiness}</span>
            </div>
            <p>{option.rationale}</p>
            <ul>
              {option.evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
