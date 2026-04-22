"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useTransition } from "react";

import { IntelligenceReadiness } from "@/components/panorama/intelligence-readiness";
import { MilestoneDirection } from "@/components/panorama/milestone-direction";
import { OverviewStrip } from "@/components/panorama/overview-strip";
import { SignalList } from "@/components/panorama/signal-list";
import type { OperationalPanorama } from "@/types/panorama";

type WorkspaceShellProps = {
  initialPanorama: OperationalPanorama;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("request_failed");
  }

  return (await response.json()) as T;
}

export function WorkspaceShell({ initialPanorama }: WorkspaceShellProps) {
  const pathname = usePathname();
  const [panorama, setPanorama] = useState(initialPanorama);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refreshWorkspace() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/panorama");
        const payload = await readJson<OperationalPanorama>(response);
        setPanorama(payload);
        setNotice("Panorama atualizado a partir dos estados atuais.");
        setErrorMessage(null);
      } catch {
        setErrorMessage(
          "Nao foi possivel atualizar o panorama. Tente novamente depois de revisar os workspaces."
        );
      }
    });
  }

  const pressureTotal = panorama.modules.reduce(
    (total, module) => total + module.pressureCount,
    0
  );

  return (
    <main className="workspace-page">
      <aside className="workspace-sidebar">
        <p className="workspace-sidebar__eyebrow">OpsCore</p>
        <h1>Panorama operacional</h1>
        <p>
          Consolide inbox, tarefas e agenda em uma leitura unica de pressao,
          preparo e proximas decisoes.
        </p>
        <nav className="workspace-sidebar__nav" aria-label="Navegacao do workspace">
          <Link
            className={pathname === "/inbox" ? "is-active" : undefined}
            href="/inbox"
          >
            Inbox
          </Link>
          <Link
            className={pathname === "/execucao" ? "is-active" : undefined}
            href="/execucao"
          >
            Tarefas
          </Link>
          <Link
            className={pathname === "/agenda" ? "is-active" : undefined}
            href="/agenda"
          >
            Agenda
          </Link>
          <Link
            className={pathname === "/panorama" ? "is-active" : undefined}
            href="/panorama"
          >
            Panorama
          </Link>
        </nav>
      </aside>

      <section className="workspace-main panorama-workspace">
        <header className="workspace-header">
          <div>
            <p className="workspace-panel__eyebrow">Panorama</p>
            <h2>Estado amplo da operacao a partir dos workspaces reais</h2>
          </div>
          <button
            className="button button--primary"
            disabled={isPending}
            onClick={refreshWorkspace}
            type="button"
          >
            Atualizar panorama
          </button>
        </header>

        <section className="panorama-status-band" aria-label="Estado operacional">
          <strong>{pressureTotal}</strong>
          <span>sinal(is) de pressao nos modulos ativos</span>
        </section>

        {notice ? (
          <p className="workspace-notice" role="status">
            {notice}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="workspace-inline-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <section className="workspace-grid panorama-grid">
          <div className="workspace-grid__table panorama-grid__overview">
            <OverviewStrip modules={panorama.modules} />
          </div>
          <div className="workspace-grid__detail">
            <SignalList signals={panorama.signals} />
          </div>
          <div className="workspace-grid__radar">
            <IntelligenceReadiness
              integration={panorama.integrationReadiness}
              intelligence={panorama.intelligenceReadiness}
            />
          </div>
          <div className="workspace-grid__detail">
            <MilestoneDirection options={panorama.nextMilestoneOptions} />
          </div>
        </section>
      </section>
    </main>
  );
}
