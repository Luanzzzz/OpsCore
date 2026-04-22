"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";

import {
  ScheduleDialog,
  type ScheduleDialogInput
} from "@/components/agenda/schedule-dialog";
import { ExecutionRadar } from "@/components/dashboard/execution-radar";
import { TaskDetailPanel } from "@/components/detail/task-detail-panel";
import { ConversionStrip } from "@/components/execution/conversion-strip";
import {
  FiltersBar,
  type WorkspaceFilters
} from "@/components/execution/filters-bar";
import { TasksTable } from "@/components/execution/tasks-table";
import type {
  ReadyToConvertItem,
  TaskDetail,
  TaskListItem,
  TaskSummary,
  UpdateTaskMetaInput,
  UpdateTaskStatusInput
} from "@/types/tasks";

type ExecutionWorkspaceProps = {
  initialItems: TaskListItem[];
  initialSelectedItem: TaskDetail | null;
  initialSummary: TaskSummary;
  initialReadyToConvert: ReadyToConvertItem[];
};

type WorkspacePayload = {
  items: TaskListItem[];
  summary: TaskSummary;
  readyToConvert: ReadyToConvertItem[];
};

const INITIAL_FILTERS: WorkspaceFilters = {
  ageBucket: "all",
  owner: "all",
  priority: "all",
  sort: "priority",
  status: "all"
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("request_failed");
  }

  return (await response.json()) as T;
}

export function WorkspaceShell({
  initialItems,
  initialReadyToConvert,
  initialSelectedItem,
  initialSummary
}: ExecutionWorkspaceProps) {
  const pathname = usePathname();
  const [items, setItems] = useState(initialItems);
  const [summary, setSummary] = useState(initialSummary);
  const [readyToConvert, setReadyToConvert] = useState(initialReadyToConvert);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialSelectedItem?.id ?? initialItems[0]?.id ?? null
  );
  const [selectedItem, setSelectedItem] = useState<TaskDetail | null>(
    initialSelectedItem
  );
  const [filters, setFilters] = useState<WorkspaceFilters>(INITIAL_FILTERS);
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
      fetch(`/api/tasks/${selectedId}`)
        .then((response) => readJson<TaskDetail>(response))
        .then((detail) => {
          if (active) {
            setSelectedItem(detail);
            setErrorMessage(null);
          }
        })
        .catch(() => {
          if (active) {
            setErrorMessage(
              "Nao foi possivel carregar o backlog de execucao. Atualize a tela ou revise a ultima conversao realizada."
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
    const response = await fetch("/api/tasks");
    const payload = await readJson<WorkspacePayload>(response);
    const resolvedSelectedId =
      targetId && payload.items.some((item) => item.id === targetId)
        ? targetId
        : payload.items[0]?.id ?? null;

    setItems(payload.items);
    setSummary(payload.summary);
    setReadyToConvert(payload.readyToConvert);
    setSelectedId(resolvedSelectedId);

    if (!resolvedSelectedId) {
      setSelectedItem(null);
      return;
    }

    const detailResponse = await fetch(`/api/tasks/${resolvedSelectedId}`);
    const detailPayload = await readJson<TaskDetail>(detailResponse);
    setSelectedItem(detailPayload);
  }

  async function handleConvert(item: ReadyToConvertItem) {
    const response = await fetch(`/api/inbox/${item.id}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originInboxId: item.id,
        ownerName: null,
        priority: item.priorityReviewed,
        status: "Nao iniciada",
        contextNote: item.reviewedNextAction ?? item.summaryShort
      })
    });
    const created = await readJson<TaskDetail>(response);

    await refreshWorkspace(created.id);
    setNotice("Entrada convertida em tarefa.");
    setErrorMessage(null);
  }

  async function handleUpdateMeta(input: UpdateTaskMetaInput) {
    if (!selectedItem) {
      return;
    }

    const response = await fetch(`/api/tasks/${selectedItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const updated = await readJson<TaskDetail>(response);

    await refreshWorkspace(updated.id);
    setNotice("Responsavel e prioridade atualizados.");
    setErrorMessage(null);
  }

  async function handleUpdateStatus(input: UpdateTaskStatusInput) {
    if (!selectedItem) {
      return;
    }

    const response = await fetch(`/api/tasks/${selectedItem.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const updated = await readJson<TaskDetail>(response);

    await refreshWorkspace(updated.id);
    setNotice("Status da tarefa atualizado.");
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
        linkedType: "task"
      })
    });
    await readJson(response);

    setScheduleDialogOpen(false);
    setNotice("Prazo agendado para a tarefa selecionada.");
    setErrorMessage(null);
  }

  function handleAsyncAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch {
        setErrorMessage(
          "Nao foi possivel carregar o backlog de execucao. Atualize a tela ou revise a ultima conversao realizada."
        );
      }
    });
  }

  return (
    <main className="workspace-page">
      <aside className="workspace-sidebar">
        <p className="workspace-sidebar__eyebrow">OpsCore</p>
        <h1>Backlog de execucao</h1>
        <p>
          Converta entradas revisadas em tarefas rastreaveis sem perder a
          origem operacional.
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
            <p className="workspace-panel__eyebrow">Tarefas</p>
            <h2>Ownership, progresso e origem em uma unica mesa</h2>
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

        <ConversionStrip
          isPending={isPending}
          items={readyToConvert}
          onConvert={(item) => handleAsyncAction(() => handleConvert(item))}
        />

        <section className="workspace-grid">
          <div className="workspace-grid__table">
            {items.length === 0 ? (
              <section className="workspace-empty-state">
                <h3>Nenhuma tarefa em execucao ainda</h3>
                <p>
                  Converta uma entrada triada para iniciar o backlog de
                  execucao, definir responsavel e acompanhar o progresso sem
                  perder a origem.
                </p>
              </section>
            ) : (
              <TasksTable
                filters={filters}
                items={items}
                onSelectItem={setSelectedId}
                selectedId={selectedId}
              />
            )}
          </div>

          <div className="workspace-grid__detail">
            <TaskDetailPanel
              detail={selectedItem}
              isPending={isPending}
              onSchedule={() => setScheduleDialogOpen(true)}
              onUpdateMeta={(input) =>
                handleAsyncAction(() => handleUpdateMeta(input))
              }
              onUpdateStatus={(input) =>
                handleAsyncAction(() => handleUpdateStatus(input))
              }
            />
          </div>

          <div className="workspace-grid__radar">
            <ExecutionRadar summary={summary} />
          </div>
        </section>
      </section>
      <ScheduleDialog
        isOpen={isScheduleDialogOpen}
        isPending={isPending}
        linkedLabel={
          selectedItem
            ? `Tarefa: ${selectedItem.title}`
            : "Tarefa selecionada"
        }
        onClose={() => setScheduleDialogOpen(false)}
        onSubmit={(input) =>
          handleAsyncAction(() => handleCreateSchedule(input))
        }
        suggestedOwner={selectedItem?.ownerName}
        suggestedTitle={selectedItem?.title ?? ""}
      />
    </main>
  );
}
