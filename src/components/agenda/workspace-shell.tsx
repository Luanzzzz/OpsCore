"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";

import { AgendaRadar } from "@/components/dashboard/agenda-radar";
import { AgendaDetailPanel } from "@/components/detail/agenda-detail-panel";
import { AgendaTable } from "@/components/agenda/agenda-table";
import {
  FiltersBar,
  type AgendaWorkspaceFilters
} from "@/components/agenda/filters-bar";
import type {
  AgendaDetail,
  AgendaListItem,
  AgendaSummary,
  UpdateAgendaItemInput,
  UpdateAgendaStatusInput
} from "@/types/agenda";

type AgendaWorkspaceProps = {
  initialItems: AgendaListItem[];
  initialSelectedItem: AgendaDetail | null;
  initialSummary: AgendaSummary;
};

type WorkspacePayload = {
  items: AgendaListItem[];
  summary: AgendaSummary;
};

const INITIAL_FILTERS: AgendaWorkspaceFilters = {
  kind: "all",
  linkedType: "all",
  sort: "urgency",
  status: "all",
  urgencyState: "all"
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("request_failed");
  }

  return (await response.json()) as T;
}

function toQuery(filters: AgendaWorkspaceFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "all") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function WorkspaceShell({
  initialItems,
  initialSelectedItem,
  initialSummary
}: AgendaWorkspaceProps) {
  const pathname = usePathname();
  const [items, setItems] = useState(initialItems);
  const [summary, setSummary] = useState(initialSummary);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialSelectedItem?.id ?? initialItems[0]?.id ?? null
  );
  const [selectedItem, setSelectedItem] = useState<AgendaDetail | null>(
    initialSelectedItem
  );
  const [filters, setFilters] =
    useState<AgendaWorkspaceFilters>(INITIAL_FILTERS);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedId && items[0]) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedItem(null);
      return;
    }

    if (selectedItem?.id === selectedId) {
      return;
    }

    let active = true;

    startTransition(() => {
      fetch(`/api/agenda/${selectedId}`)
        .then((response) => readJson<AgendaDetail>(response))
        .then((detail) => {
          if (active) {
            setSelectedItem(detail);
            setErrorMessage(null);
          }
        })
        .catch(() => {
          if (active) {
            setErrorMessage(
              "Nao foi possivel carregar a agenda. Atualize a tela ou revise o ultimo prazo alterado."
            );
          }
        });
    });

    return () => {
      active = false;
    };
  }, [selectedId, selectedItem]);

  async function refreshWorkspace(nextSelectedId?: number | null) {
    const targetId = nextSelectedId ?? selectedId;
    const response = await fetch(`/api/agenda${toQuery(filters)}`);
    const payload = await readJson<WorkspacePayload>(response);
    const resolvedSelectedId =
      targetId && payload.items.some((item) => item.id === targetId)
        ? targetId
        : payload.items[0]?.id ?? null;

    setItems(payload.items);
    setSummary(payload.summary);
    setSelectedId(resolvedSelectedId);

    if (!resolvedSelectedId) {
      setSelectedItem(null);
      return;
    }

    const detailResponse = await fetch(`/api/agenda/${resolvedSelectedId}`);
    const detailPayload = await readJson<AgendaDetail>(detailResponse);
    setSelectedItem(detailPayload);
  }

  async function handleUpdateItem(input: UpdateAgendaItemInput) {
    if (!selectedItem) {
      return;
    }

    const response = await fetch(`/api/agenda/${selectedItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const updated = await readJson<AgendaDetail>(response);

    await refreshWorkspace(updated.id);
    setNotice("Item de agenda reagendado.");
    setErrorMessage(null);
  }

  async function handleUpdateStatus(input: UpdateAgendaStatusInput) {
    if (!selectedItem) {
      return;
    }

    const response = await fetch(`/api/agenda/${selectedItem.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const updated = await readJson<AgendaDetail>(response);

    await refreshWorkspace(updated.id);
    setNotice("Status da agenda atualizado.");
    setErrorMessage(null);
  }

  function handleAsyncAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch {
        setErrorMessage(
          "Nao foi possivel carregar a agenda. Atualize a tela ou revise o ultimo prazo alterado."
        );
      }
    });
  }

  function handleFilterChange(nextFilters: AgendaWorkspaceFilters) {
    setFilters(nextFilters);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/agenda${toQuery(nextFilters)}`);
        const payload = await readJson<WorkspacePayload>(response);
        setItems(payload.items);
        setSummary(payload.summary);
        setSelectedId(payload.items[0]?.id ?? null);
        setSelectedItem(null);
      } catch {
        setErrorMessage("Nao foi possivel aplicar os filtros da agenda.");
      }
    });
  }

  return (
    <main className="workspace-page">
      <aside className="workspace-sidebar">
        <p className="workspace-sidebar__eyebrow">OpsCore</p>
        <h1>Agenda operacional</h1>
        <p>
          Acompanhe follow-ups, prazos e compromissos ligados ao fluxo de inbox
          e tarefas.
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

      <section className="workspace-main">
        <header className="workspace-header">
          <div>
            <p className="workspace-panel__eyebrow">Agenda</p>
            <h2>Vencimentos, follow-ups e compromissos em uma fila unica</h2>
          </div>
          <FiltersBar filters={filters} onChange={handleFilterChange} />
        </header>

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

        <section className="workspace-grid">
          <div className="workspace-grid__table">
            {items.length === 0 ? (
              <section className="workspace-empty-state">
                <h3>Nenhum item de agenda aberto</h3>
                <p>
                  Agende follow-ups e prazos a partir de entradas ou tarefas
                  para montar a visao temporal da operacao.
                </p>
              </section>
            ) : (
              <AgendaTable
                filters={filters}
                items={items}
                onSelectItem={setSelectedId}
                selectedId={selectedId}
              />
            )}
          </div>

          <div className="workspace-grid__detail">
            <AgendaDetailPanel
              detail={selectedItem}
              isPending={isPending}
              onUpdateItem={(input) =>
                handleAsyncAction(() => handleUpdateItem(input))
              }
              onUpdateStatus={(input) =>
                handleAsyncAction(() => handleUpdateStatus(input))
              }
            />
          </div>

          <div className="workspace-grid__radar">
            <AgendaRadar summary={summary} />
          </div>
        </section>
      </section>
    </main>
  );
}
