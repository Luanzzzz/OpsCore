import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  CreateInboxInput,
  DashboardSummary,
  InboxDetail,
  InboxFilters,
  InboxListItem,
  InboxPriority,
  InboxStatus,
  TriageReviewInput,
  TriageStatus
} from "@/types/inbox";

const DATA_DIR = path.join(
  process.cwd(),
  ".data",
  process.env.VITEST_POOL_ID ? `vitest-${process.env.VITEST_POOL_ID}` : ""
);
const DATA_FILE = path.join(DATA_DIR, "inbox-items.json");

export type PersistedInboxItem = InboxDetail & {
  createdAt: string;
  updatedAt: string;
};

const PRIORITY_WEIGHT: Record<InboxPriority, number> = {
  Baixa: 0,
  Media: 1,
  Alta: 2,
  Critica: 3
};

function toListItem(item: PersistedInboxItem): InboxListItem {
  return {
    id: item.id,
    title: item.title,
    source: item.source,
    summaryShort: item.summaryShort,
    status: item.status,
    priorityReviewed: item.priorityReviewed,
    waitingOnResponse: item.waitingOnResponse,
    lastActivityAt: item.lastActivityAt,
    triageStatus: item.triageStatus
  };
}

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readStore(): Promise<PersistedInboxItem[]> {
  await ensureStore();
  const raw = await readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as PersistedInboxItem[];
}

async function writeStore(items: PersistedInboxItem[]) {
  await ensureStore();
  await writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

export function resetInboxStore() {
  return writeStore([]);
}

async function updateInboxItems(
  updater: (items: PersistedInboxItem[]) => PersistedInboxItem[]
) {
  const items = await readStore();
  const updated = updater(items);
  await writeStore(updated);
  return updated;
}

export async function createInboxItem(
  input: CreateInboxInput
): Promise<PersistedInboxItem> {
  const items = await readStore();
  const now = new Date().toISOString();
  const nextId =
    items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;

  const item: PersistedInboxItem = {
    id: nextId,
    title: input.title,
    source: input.source,
    summaryShort: input.summaryShort,
    descriptionRaw: input.descriptionRaw ?? input.summaryShort,
    status: (input.status ?? "Nova") as InboxStatus,
    priorityReviewed: (input.priorityReviewed ?? "Media") as InboxPriority,
    waitingOnResponse: input.waitingOnResponse ?? false,
    lastActivityAt: now,
    triageStatus: "pending" as TriageStatus,
    aiSuggestion: null,
    reviewedCategory: null,
    reviewedNextAction: null,
    triageReviewedAt: null,
    createdAt: now,
    updatedAt: now
  };

  items.push(item);
  await writeStore(items);
  return item;
}

export async function getInboxItems(
  filters: InboxFilters = {}
): Promise<InboxListItem[]> {
  const items = await readStore();
  return items
    .filter((item) => !filters.status || item.status === filters.status)
    .filter(
      (item) => !filters.priority || item.priorityReviewed === filters.priority
    )
    .sort((left, right) => {
      const priorityDelta =
        PRIORITY_WEIGHT[right.priorityReviewed] -
        PRIORITY_WEIGHT[left.priorityReviewed];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return (
        new Date(left.lastActivityAt).getTime() -
        new Date(right.lastActivityAt).getTime()
      );
    })
    .map(toListItem);
}

export async function getInboxItemById(
  id: number
): Promise<PersistedInboxItem | null> {
  const items = await readStore();
  return items.find((item) => item.id === id) ?? null;
}

export async function saveInboxTriageSuggestion(
  id: number,
  suggestion: PersistedInboxItem["aiSuggestion"]
) {
  const updated = await updateInboxItems((items) =>
    items.map((item) =>
      item.id === id
        ? {
            ...item,
            aiSuggestion: suggestion,
            triageStatus: "ready",
            updatedAt: new Date().toISOString()
          }
        : item
    )
  );

  return updated.find((item) => item.id === id) ?? null;
}

export async function reviewInboxItem(id: number, review: TriageReviewInput) {
  const updated = await updateInboxItems((items) =>
    items.map((item) =>
      item.id === id
        ? {
            ...item,
            reviewedCategory:
              review.reviewedCategory ?? item.reviewedCategory ?? item.aiSuggestion?.category ?? null,
            reviewedNextAction:
              review.reviewedNextAction ?? item.reviewedNextAction ?? item.aiSuggestion?.nextAction ?? null,
            priorityReviewed:
              review.priorityReviewed ?? item.priorityReviewed,
            status: review.status ?? item.status,
            waitingOnResponse:
              review.waitingOnResponse ?? item.waitingOnResponse,
            triageStatus: "reviewed",
            triageReviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : item
    )
  );

  return updated.find((item) => item.id === id) ?? null;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const items = await readStore();
  const now = Date.now();
  const byStatus = (
    ["Nova", "Em analise", "Aguardando resposta", "Concluida/Arquivada"] as InboxStatus[]
  ).map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length
  }));

  const waitingOnResponseCount = items.filter(
    (item) => item.waitingOnResponse
  ).length;
  const highPriorityCount = items.filter((item) =>
    ["Alta", "Critica"].includes(item.priorityReviewed)
  ).length;
  const unreviewedTriageCount = items.filter(
    (item) => item.triageStatus !== "reviewed"
  ).length;
  const oldestItems = [...items]
    .sort(
      (left, right) =>
        new Date(left.lastActivityAt).getTime() -
        new Date(right.lastActivityAt).getTime()
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      title: item.title,
      ageHours: Math.round((now - new Date(item.lastActivityAt).getTime()) / 36e5)
    }));

  const averageResponseAgeHours =
    items.length === 0
      ? 0
      : Math.round(
          items.reduce(
            (sum, item) =>
              sum + (now - new Date(item.lastActivityAt).getTime()) / 36e5,
            0
          ) / items.length
        );

  return {
    byStatus,
    highPriorityCount,
    waitingOnResponseCount,
    unreviewedTriageCount,
    oldestItems,
    averageResponseAgeHours
  };
}
