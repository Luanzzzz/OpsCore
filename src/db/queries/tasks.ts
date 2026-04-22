import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getInboxItemById, getInboxItems } from "@/db/queries/inbox";
import type { PersistedInboxItem } from "@/db/queries/inbox";
import type {
  CreateTaskFromInboxInput,
  CreateTaskFromInboxResult,
  ReadyToConvertItem,
  TaskDetail,
  TaskFilters,
  TaskListItem,
  TaskOriginSnapshot,
  TaskPriority,
  TaskSummary,
  TaskTimelineEvent,
  UpdateTaskMetaInput,
  UpdateTaskStatusInput
} from "@/types/tasks";

const DATA_DIR = path.join(
  process.cwd(),
  ".data",
  process.env.VITEST_POOL_ID ? `vitest-${process.env.VITEST_POOL_ID}` : ""
);
const DATA_FILE = path.join(DATA_DIR, "tasks.json");
const AGED_THRESHOLD_HOURS = 48;

type PersistedTask = TaskDetail;

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  Baixa: 0,
  Media: 1,
  Alta: 2,
  Critica: 3
};

function getAgeHours(date: string) {
  return Math.max(
    0,
    Math.round((Date.now() - new Date(date).getTime()) / 36e5)
  );
}

function isActiveTask(task: PersistedTask) {
  return task.status !== "Concluida";
}

function toListItem(task: PersistedTask): TaskListItem {
  return {
    id: task.id,
    originInboxId: task.originInboxId,
    title: task.title,
    ownerName: task.ownerName,
    priority: task.priority,
    status: task.status,
    originTitle: task.origin.title,
    originSource: task.origin.source,
    originSummaryShort: task.origin.summaryShort,
    lastMovementAt: task.lastMovementAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    ageHours: getAgeHours(task.lastMovementAt)
  };
}

function toReadyToConvertItem(origin: PersistedInboxItem): ReadyToConvertItem {
  return {
    id: origin.id,
    title: origin.title,
    source: origin.source,
    summaryShort: origin.summaryShort,
    priorityReviewed: origin.priorityReviewed,
    reviewedCategory: origin.reviewedCategory,
    reviewedNextAction: origin.reviewedNextAction,
    triageStatus: origin.triageStatus,
    lastActivityAt: origin.lastActivityAt,
    ageHours: getAgeHours(origin.lastActivityAt)
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

async function readStore(): Promise<PersistedTask[]> {
  await ensureStore();
  const raw = await readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as PersistedTask[];
}

async function writeStore(tasks: PersistedTask[]) {
  await ensureStore();
  await writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf8");
}

export function resetTasksStore() {
  return writeStore([]);
}

function buildOriginSnapshot(origin: PersistedInboxItem): TaskOriginSnapshot {
  return {
    inboxId: origin.id,
    title: origin.title,
    source: origin.source,
    summaryShort: origin.summaryShort,
    reviewedCategory: origin.reviewedCategory,
    reviewedNextAction: origin.reviewedNextAction,
    triageStatus: origin.triageStatus
  };
}

export async function createTaskFromInbox(
  input: CreateTaskFromInboxInput
): Promise<CreateTaskFromInboxResult> {
  const origin = await getInboxItemById(input.originInboxId);

  if (!origin) {
    return { ok: false, code: "origin-not-found" };
  }

  const tasks = await readStore();
  const alreadyActive = tasks.some(
    (task) => task.originInboxId === origin.id && isActiveTask(task)
  );

  if (alreadyActive) {
    return { ok: false, code: "origin-already-active" };
  }

  const now = new Date().toISOString();
  const nextId =
    tasks.reduce((highest, task) => Math.max(highest, task.id), 0) + 1;
  const title = input.title?.trim() || origin.title;
  const status = input.status ?? "Nao iniciada";
  const timeline: TaskTimelineEvent[] = [
    {
      type: "conversion",
      at: now,
      note: "Tarefa criada a partir do inbox revisado.",
      toStatus: status
    }
  ];

  const task: PersistedTask = {
    id: nextId,
    originInboxId: origin.id,
    title,
    ownerName: input.ownerName?.trim() || null,
    priority: input.priority ?? origin.priorityReviewed,
    status,
    originTitle: origin.title,
    originSource: origin.source,
    originSummaryShort: origin.summaryShort,
    contextNote:
      input.contextNote ?? origin.reviewedNextAction ?? origin.summaryShort,
    origin: buildOriginSnapshot(origin),
    timeline,
    lastMovementAt: now,
    createdAt: now,
    updatedAt: now,
    ageHours: 0
  };

  tasks.push(task);
  await writeStore(tasks);

  return { ok: true, task };
}

export async function getTasks(
  filters: TaskFilters = {}
): Promise<TaskListItem[]> {
  const tasks = await readStore();

  return tasks
    .filter((task) => !filters.status || task.status === filters.status)
    .filter((task) => !filters.priority || task.priority === filters.priority)
    .filter((task) => {
      if (!filters.owner) {
        return true;
      }

      if (filters.owner === "unassigned") {
        return !task.ownerName;
      }

      return task.ownerName
        ?.toLowerCase()
        .includes(filters.owner.toLowerCase());
    })
    .filter((task) => {
      const ageHours = getAgeHours(task.lastMovementAt);

      if (!filters.ageBucket || filters.ageBucket === "all") {
        return true;
      }

      if (filters.ageBucket === "fresh") {
        return ageHours < 24;
      }

      if (filters.ageBucket === "aging") {
        return ageHours >= 24 && ageHours < AGED_THRESHOLD_HOURS;
      }

      return ageHours >= AGED_THRESHOLD_HOURS;
    })
    .sort((left, right) => {
      if (filters.sort === "oldest") {
        return (
          new Date(left.lastMovementAt).getTime() -
          new Date(right.lastMovementAt).getTime()
        );
      }

      if (filters.sort === "recent") {
        return (
          new Date(right.lastMovementAt).getTime() -
          new Date(left.lastMovementAt).getTime()
        );
      }

      const priorityDelta =
        PRIORITY_WEIGHT[right.priority] - PRIORITY_WEIGHT[left.priority];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return (
        new Date(left.lastMovementAt).getTime() -
        new Date(right.lastMovementAt).getTime()
      );
    })
    .map(toListItem);
}

export async function getTaskById(id: number): Promise<TaskDetail | null> {
  const tasks = await readStore();
  const task = tasks.find((item) => item.id === id);
  return task ? { ...task, ageHours: getAgeHours(task.lastMovementAt) } : null;
}

export async function updateTaskMeta(
  id: number,
  input: UpdateTaskMetaInput
): Promise<TaskDetail | null> {
  const tasks = await readStore();
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return null;
  }

  const now = new Date().toISOString();
  const current = tasks[index];
  const ownerName =
    input.ownerName === undefined
      ? current.ownerName
      : input.ownerName?.trim() || null;
  const priority = input.priority ?? current.priority;

  const next: PersistedTask = {
    ...current,
    ownerName,
    priority,
    updatedAt: now,
    timeline: [
      ...current.timeline,
      {
        type: "meta_updated",
        at: now,
        note: "Responsavel ou prioridade atualizados."
      }
    ]
  };

  tasks[index] = next;
  await writeStore(tasks);
  return { ...next, ageHours: getAgeHours(next.lastMovementAt) };
}

export async function updateTaskStatus(
  id: number,
  input: UpdateTaskStatusInput
): Promise<TaskDetail | null> {
  const tasks = await readStore();
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return null;
  }

  const now = new Date().toISOString();
  const current = tasks[index];
  const next: PersistedTask = {
    ...current,
    status: input.status,
    lastMovementAt: now,
    updatedAt: now,
    timeline: [
      ...current.timeline,
      {
        type: "status_updated",
        at: now,
        note: input.movementNote ?? "Status da tarefa atualizado.",
        fromStatus: current.status,
        toStatus: input.status
      }
    ]
  };

  tasks[index] = next;
  await writeStore(tasks);
  return { ...next, ageHours: 0 };
}

export async function getReadyToConvertItems(): Promise<ReadyToConvertItem[]> {
  const [inboxItems, tasks] = await Promise.all([getInboxItems(), readStore()]);
  const activeOrigins = new Set(
    tasks.filter(isActiveTask).map((task) => task.originInboxId)
  );
  const reviewedItems = inboxItems.filter(
    (item) => item.triageStatus === "reviewed" && !activeOrigins.has(item.id)
  );
  const details = await Promise.all(
    reviewedItems.map((item) => getInboxItemById(item.id))
  );

  return details
    .filter((item): item is PersistedInboxItem => Boolean(item))
    .map(toReadyToConvertItem)
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
    });
}

export async function getExecutionSummary(): Promise<TaskSummary> {
  const [tasks, readyToConvert] = await Promise.all([
    readStore(),
    getReadyToConvertItems()
  ]);
  const activeTasks = tasks.filter(isActiveTask);

  return {
    totalCount: tasks.length,
    activeCount: activeTasks.length,
    readyToConvertCount: readyToConvert.length,
    unassignedCount: activeTasks.filter((task) => !task.ownerName).length,
    blockedCount: activeTasks.filter((task) => task.status === "Bloqueada")
      .length,
    criticalCount: activeTasks.filter((task) => task.priority === "Critica")
      .length,
    agedCount: activeTasks.filter(
      (task) => getAgeHours(task.lastMovementAt) >= AGED_THRESHOLD_HOURS
    ).length
  };
}
