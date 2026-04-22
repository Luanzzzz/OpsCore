import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getInboxItemById } from "@/db/queries/inbox";
import { getTaskById } from "@/db/queries/tasks";
import type {
  AgendaDetail,
  AgendaFilters,
  AgendaListItem,
  AgendaOriginPriority,
  AgendaOriginSnapshot,
  AgendaStatus,
  AgendaSummary,
  AgendaTimelineEvent,
  AgendaUrgencyState,
  CreateAgendaItemInput,
  CreateAgendaItemResult,
  UpdateAgendaItemInput,
  UpdateAgendaStatusInput
} from "@/types/agenda";

const DATA_DIR = path.join(
  process.cwd(),
  ".data",
  process.env.VITEST_POOL_ID ? `vitest-${process.env.VITEST_POOL_ID}` : ""
);
const DATA_FILE = path.join(DATA_DIR, "agenda-items.json");

type PersistedAgendaItem = AgendaDetail;

const PRIORITY_WEIGHT: Record<AgendaOriginPriority, number> = {
  Baixa: 0,
  Media: 1,
  Alta: 2,
  Critica: 3
};

const URGENCY_WEIGHT: Record<AgendaUrgencyState, number> = {
  vencido: 0,
  hoje: 1,
  proximo: 2,
  futuro: 3
};

function toIsoDate(date: string) {
  return new Date(date).toISOString();
}

export function getAgendaUrgencyState(
  dueAt: string,
  status: AgendaStatus
): AgendaUrgencyState {
  if (status !== "Aberto") {
    return "futuro";
  }

  const deltaHours = (new Date(dueAt).getTime() - Date.now()) / 36e5;

  if (deltaHours < 0) {
    return "vencido";
  }

  if (deltaHours <= 24) {
    return "hoje";
  }

  if (deltaHours <= 72) {
    return "proximo";
  }

  return "futuro";
}

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readStore(): Promise<PersistedAgendaItem[]> {
  await ensureStore();
  const raw = await readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as PersistedAgendaItem[];
}

async function writeStore(items: PersistedAgendaItem[]) {
  await ensureStore();
  await writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

async function updateAgendaItems(
  updater: (items: PersistedAgendaItem[]) => PersistedAgendaItem[]
) {
  const items = await readStore();
  const updated = updater(items);
  await writeStore(updated);
  return updated;
}

export function resetAgendaStore() {
  return writeStore([]);
}

function toListItem(item: PersistedAgendaItem): AgendaListItem {
  const urgencyState = getAgendaUrgencyState(item.dueAt, item.status);

  return {
    id: item.id,
    linkedType: item.linkedType,
    linkedId: item.linkedId,
    title: item.title,
    kind: item.kind,
    dueAt: item.dueAt,
    status: item.status,
    ownerName: item.ownerName,
    notes: item.notes,
    originTitle: item.originSnapshot.title,
    originSourceLabel: item.originSnapshot.sourceLabel,
    originSummary: item.originSnapshot.summary,
    originPriority: item.originSnapshot.priority,
    originStatusLabel: item.originSnapshot.statusLabel,
    urgencyState,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

function withDerivedState(item: PersistedAgendaItem): AgendaDetail {
  return {
    ...item,
    urgencyState: getAgendaUrgencyState(item.dueAt, item.status)
  };
}

async function buildOriginSnapshot(
  input: CreateAgendaItemInput
): Promise<AgendaOriginSnapshot | null> {
  if (input.linkedType === "inbox") {
    const origin = await getInboxItemById(input.linkedId);

    if (!origin) {
      return null;
    }

    return {
      linkedType: "inbox",
      linkedId: origin.id,
      title: origin.title,
      sourceLabel: origin.source,
      summary: origin.summaryShort,
      priority: origin.priorityReviewed,
      ownerName: null,
      statusLabel: origin.status
    };
  }

  const task = await getTaskById(input.linkedId);

  if (!task) {
    return null;
  }

  return {
    linkedType: "task",
    linkedId: task.id,
    title: task.title,
    sourceLabel: task.originSource,
    summary: task.originSummaryShort,
    priority: task.priority,
    ownerName: task.ownerName,
    statusLabel: task.status
  };
}

function isActiveDuplicate(
  item: PersistedAgendaItem,
  input: CreateAgendaItemInput
) {
  return (
    item.status === "Aberto" &&
    item.linkedType === input.linkedType &&
    item.linkedId === input.linkedId &&
    item.kind === input.kind &&
    item.dueAt === toIsoDate(input.dueAt)
  );
}

export async function createAgendaItem(
  input: CreateAgendaItemInput
): Promise<CreateAgendaItemResult> {
  const originSnapshot = await buildOriginSnapshot(input);

  if (!originSnapshot) {
    return { ok: false, code: "linked-origin-not-found" };
  }

  const items = await readStore();

  if (items.some((item) => isActiveDuplicate(item, input))) {
    return { ok: false, code: "active-duplicate" };
  }

  const now = new Date().toISOString();
  const dueAt = toIsoDate(input.dueAt);
  const nextId =
    items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
  const title = input.title?.trim() || originSnapshot.title;
  const timeline: AgendaTimelineEvent[] = [
    {
      type: "created",
      at: now,
      note: "Item de agenda criado a partir do fluxo operacional.",
      toStatus: "Aberto",
      toDueAt: dueAt
    }
  ];
  const item: PersistedAgendaItem = {
    id: nextId,
    linkedType: input.linkedType,
    linkedId: input.linkedId,
    title,
    kind: input.kind,
    dueAt,
    status: "Aberto",
    ownerName: input.ownerName?.trim() || originSnapshot.ownerName || null,
    notes: input.notes?.trim() || null,
    originTitle: originSnapshot.title,
    originSourceLabel: originSnapshot.sourceLabel,
    originSummary: originSnapshot.summary,
    originPriority: originSnapshot.priority,
    originStatusLabel: originSnapshot.statusLabel,
    urgencyState: getAgendaUrgencyState(dueAt, "Aberto"),
    originSnapshot,
    timeline,
    completedAt: null,
    cancelledAt: null,
    createdAt: now,
    updatedAt: now
  };

  items.push(item);
  await writeStore(items);

  return { ok: true, item: withDerivedState(item) };
}

export async function getAgendaItems(
  filters: AgendaFilters = {}
): Promise<AgendaListItem[]> {
  const items = await readStore();

  return items
    .map(toListItem)
    .filter((item) => !filters.linkedType || item.linkedType === filters.linkedType)
    .filter((item) => !filters.kind || item.kind === filters.kind)
    .filter((item) => !filters.status || item.status === filters.status)
    .filter(
      (item) =>
        !filters.urgencyState || item.urgencyState === filters.urgencyState
    )
    .filter((item) => {
      if (!filters.owner) {
        return true;
      }

      if (filters.owner === "unassigned") {
        return !item.ownerName;
      }

      return item.ownerName
        ?.toLowerCase()
        .includes(filters.owner.toLowerCase());
    })
    .sort((left, right) => {
      if (filters.sort === "recent") {
        return (
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        );
      }

      if (filters.sort === "dueAt") {
        return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
      }

      const urgencyDelta =
        URGENCY_WEIGHT[left.urgencyState] - URGENCY_WEIGHT[right.urgencyState];

      if (urgencyDelta !== 0) {
        return urgencyDelta;
      }

      const dueDelta =
        new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();

      if (dueDelta !== 0) {
        return dueDelta;
      }

      return (
        PRIORITY_WEIGHT[right.originPriority] -
        PRIORITY_WEIGHT[left.originPriority]
      );
    });
}

export async function getAgendaItemById(
  id: number
): Promise<AgendaDetail | null> {
  const items = await readStore();
  const item = items.find((agendaItem) => agendaItem.id === id);
  return item ? withDerivedState(item) : null;
}

export async function updateAgendaItem(
  id: number,
  input: UpdateAgendaItemInput
): Promise<AgendaDetail | null> {
  const items = await readStore();
  const current = items.find((item) => item.id === id);

  if (!current) {
    return null;
  }

  const now = new Date().toISOString();
  const dueAt = input.dueAt ? toIsoDate(input.dueAt) : current.dueAt;
  const didReschedule = dueAt !== current.dueAt;
  const next: PersistedAgendaItem = {
    ...current,
    kind: input.kind ?? current.kind,
    title: input.title?.trim() || current.title,
    dueAt,
    ownerName:
      input.ownerName === undefined
        ? current.ownerName
        : input.ownerName?.trim() || null,
    notes:
      input.notes === undefined ? current.notes : input.notes?.trim() || null,
    updatedAt: now,
    timeline: [
      ...current.timeline,
      {
        type: didReschedule ? "rescheduled" : "updated",
        at: now,
        note: didReschedule
          ? "Item de agenda reagendado."
          : "Item de agenda atualizado.",
        fromDueAt: didReschedule ? current.dueAt : undefined,
        toDueAt: didReschedule ? dueAt : undefined
      }
    ]
  };

  await updateAgendaItems((stored) =>
    stored.map((item) => (item.id === id ? next : item))
  );

  return withDerivedState(next);
}

export async function updateAgendaStatus(
  id: number,
  input: UpdateAgendaStatusInput
): Promise<AgendaDetail | null> {
  const items = await readStore();
  const current = items.find((item) => item.id === id);

  if (!current) {
    return null;
  }

  const now = new Date().toISOString();
  const status = input.status;
  const eventType =
    status === "Concluido"
      ? "completed"
      : status === "Cancelado"
        ? "cancelled"
        : "updated";
  const next: PersistedAgendaItem = {
    ...current,
    status,
    completedAt: status === "Concluido" ? now : null,
    cancelledAt: status === "Cancelado" ? now : null,
    updatedAt: now,
    timeline: [
      ...current.timeline,
      {
        type: eventType,
        at: now,
        note: input.movementNote ?? "Status do item de agenda atualizado.",
        fromStatus: current.status,
        toStatus: status
      }
    ]
  };

  await updateAgendaItems((stored) =>
    stored.map((item) => (item.id === id ? next : item))
  );

  return withDerivedState(next);
}

export async function getAgendaSummary(): Promise<AgendaSummary> {
  const items = await readStore();
  const list = items.map(toListItem);
  const active = list.filter((item) => item.status === "Aberto");

  return {
    totalCount: list.length,
    activeCount: active.length,
    overdueCount: active.filter((item) => item.urgencyState === "vencido")
      .length,
    dueTodayCount: active.filter((item) => item.urgencyState === "hoje")
      .length,
    upcomingCount: active.filter((item) => item.urgencyState === "proximo")
      .length,
    futureCount: active.filter((item) => item.urgencyState === "futuro")
      .length,
    completedCount: list.filter((item) => item.status === "Concluido").length,
    cancelledCount: list.filter((item) => item.status === "Cancelado").length,
    criticalItems: active
      .filter((item) =>
        ["vencido", "hoje", "proximo"].includes(item.urgencyState)
      )
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        dueAt: item.dueAt,
        urgencyState: item.urgencyState
      }))
  };
}
