"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";

import { FiltersBar, type WorkspaceFilters } from "./filters-bar";
import { InboxTable } from "./inbox-table";
import { NewEntryDialog } from "./new-entry-dialog";

import {
  ScheduleDialog,
  type ScheduleDialogInput
} from "@/components/agenda/schedule-dialog";
import { ItemDetailPanel } from "@/components/detail/item-detail-panel";
import { OpsRadar } from "@/components/dashboard/ops-radar";
import type {
  CreateInboxInput,
  DashboardSummary,
  InboxDetail,
  InboxListItem,
  TriageReviewInput
} from "@/types/inbox";

type WorkspaceShellProps = {
  initialDashboard: DashboardSummary;
  initialItems: InboxListItem[];
  initialSelectedItem: InboxDetail | null;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("request_failed");
  }

  return (await response.json()) as T;
}

export function WorkspaceShell({
  initialDashboard,
  initialItems,
  initialSelectedItem
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const [items, setItems] = useState(initialItems);
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialSelectedItem?.id ?? initialItems[0]?.id ?? null
  );
  const [selectedItem, setSelectedItem] = useState<InboxDetail | null>(
    initialSelectedItem
  );
  const [filters, setFilters] = useState<WorkspaceFilters>({
    status: "all",
    priority: "all",
    sort: "priority"
  });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setScheduleDialogOpen] = useState(false);
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
      fetch(`/api/inbox/${selectedId}`)
        .then((response) => readJson<InboxDetail>(response))
        .then((detail) => {
          if (active) {
            setSelectedItem(detail);
            setErrorMessage(null);
          }
        })
        .catch(() => {
          if (active) {
            setErrorMessage(
              "Nao foi possivel carregar a fila operacional. Tente atualizar a tela ou revise os dados da entrada mais recente."
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
    const [itemsResponse, dashboardResponse] = await Promise.all([
      fetch("/api/inbox"),
      fetch("/api/dashboard")
    ]);

    const itemsPayload = await readJson<{ items: InboxListItem[] }>(itemsResponse);
    const dashboardPayload = await readJson<DashboardSummary>(dashboardResponse);
    const nextItems = itemsPayload.items;
    const resolvedSelectedId =
      targetId && nextItems.some((item) => item.id === targetId)
        ? targetId
        : nextItems[0]?.id ?? null;

    setItems(nextItems);
    setDashboard(dashboardPayload);
    setSelectedId(resolvedSelectedId);

    if (!resolvedSelectedId) {
      setSelectedItem(null);
      return;
    }

    const detailResponse = await fetch(`/api/inbox/${resolvedSelectedId}`);
    const detailPayload = await readJson<InboxDetail>(detailResponse);
    setSelectedItem(detailPayload);
  }

  async function handleCreateEntry(input: CreateInboxInput) {
    const response = await fetch("/api/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const created = await readJson<InboxDetail>(response);

    await refreshWorkspace(created.id);
    setDialogOpen(false);
    setNotice("Entrada registrada na fila operacional.");
    setErrorMessage(null);
  }

  async function handleRunTriage(inboxId: number) {
    const response = await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inboxId })
    });
    const payload = await readJson<{ item: InboxDetail }>(response);

    await refreshWorkspace(payload.item.id);
    setNotice("Sugestoes de IA atualizadas para o item selecionado.");
    setErrorMessage(null);
  }

  async function handleReview(inboxId: number, review: TriageReviewInput) {
    const response = await fetch(`/api/inbox/${inboxId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review)
    });
    const updated = await readJson<InboxDetail>(response);

    await refreshWorkspace(updated.id);
    setNotice("Revisao humana registrada no item.");
    setErrorMessage(null);
  }

  async function handleCreateSchedule(input: ScheduleDialogInput) {
    if (!selectedItem) {
      return;
    }

    const response = await fetch("/api/agenda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        linkedId: selectedItem.id,
        linkedType: "inbox"
      })
    });
    await readJson(response);

    setScheduleDialogOpen(false);
    setNotice("Follow-up agendado para a entrada selecionada.");
    setErrorMessage(null);
  }

  function handleAsyncAction(action: () => Promise<void>) {
    startTransition(() => {
      action().catch(() => {
        setErrorMessage(
          "Nao foi possivel carregar a fila operacional. Tente atualizar a tela ou revise os dados da entrada mais recente."
        );
      });
    });
  }

  const isEmpty = items.length === 0;

  return (
    <main className="workspace-page">
      <aside className="workspace-sidebar">
        <p className="workspace-sidebar__eyebrow">OpsCore</p>
        <h1>Fila operacional</h1>
        <p>
          Centralize entrada, triagem e leitura do estado da operacao sem
          trocar de tela.
        </p>
        <button
          className="button button--primary"
          onClick={() => setDialogOpen(true)}
          type="button"
        >
          Registrar entrada
        </button>
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
            <p className="workspace-panel__eyebrow">Inbox operacional</p>
            <h2>Prioridade, contexto e proxima acao na mesma tela</h2>
          </div>
          <FiltersBar filters={filters} onChange={setFilters} />
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

        {isEmpty ? (
          <section className="workspace-empty-state">
            <h3>Nenhuma entrada operacional ainda</h3>
            <p>
              Registre a primeira entrada para iniciar a fila, receber triagem
              com IA e montar o radar operacional.
            </p>
            <button
              className="button button--primary"
              onClick={() => setDialogOpen(true)}
              type="button"
            >
              Registrar entrada
            </button>
          </section>
        ) : (
          <div className="workspace-grid">
            <div className="workspace-grid__table">
              <InboxTable
                filters={filters}
                items={items}
                onSelectItem={setSelectedId}
                selectedId={selectedId}
              />
            </div>

            <div className="workspace-grid__detail">
              <ItemDetailPanel
                detail={selectedItem}
                isPending={isPending}
                onSchedule={() => setScheduleDialogOpen(true)}
                onReview={(review) => {
                  if (!selectedItem) {
                    return;
                  }

                  handleAsyncAction(() => handleReview(selectedItem.id, review));
                }}
                onRunTriage={() => {
                  if (!selectedItem) {
                    return;
                  }

                  handleAsyncAction(() => handleRunTriage(selectedItem.id));
                }}
              />
            </div>

            <div className="workspace-grid__radar">
              <OpsRadar dashboard={dashboard} />
            </div>
          </div>
        )}
      </section>

      <NewEntryDialog
        isOpen={isDialogOpen}
        isPending={isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={(input) => handleAsyncAction(() => handleCreateEntry(input))}
      />
      <ScheduleDialog
        isOpen={isScheduleDialogOpen}
        isPending={isPending}
        linkedLabel={
          selectedItem
            ? `Entrada: ${selectedItem.title}`
            : "Entrada selecionada"
        }
        onClose={() => setScheduleDialogOpen(false)}
        onSubmit={(input) =>
          handleAsyncAction(() => handleCreateSchedule(input))
        }
        suggestedTitle={selectedItem?.reviewedNextAction ?? selectedItem?.title ?? ""}
      />
    </main>
  );
}
