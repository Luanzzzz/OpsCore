import type { InboxPriority, TriageStatus } from "@/types/inbox";

export const TASK_STATUSES = [
  "Nao iniciada",
  "Em andamento",
  "Bloqueada",
  "Concluida"
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = [
  "Baixa",
  "Media",
  "Alta",
  "Critica"
] as const satisfies readonly InboxPriority[];

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskTimelineEventType =
  | "conversion"
  | "meta_updated"
  | "status_updated";

export interface TaskOriginSnapshot {
  inboxId: number;
  title: string;
  source: string;
  summaryShort: string;
  reviewedCategory: string | null;
  reviewedNextAction: string | null;
  triageStatus: TriageStatus;
}

export interface TaskTimelineEvent {
  type: TaskTimelineEventType;
  at: string;
  note: string;
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
}

export interface TaskListItem {
  id: number;
  originInboxId: number;
  title: string;
  ownerName: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  originTitle: string;
  originSource: string;
  originSummaryShort: string;
  lastMovementAt: string;
  createdAt: string;
  updatedAt: string;
  ageHours: number;
}

export interface TaskDetail extends TaskListItem {
  contextNote: string | null;
  origin: TaskOriginSnapshot;
  timeline: TaskTimelineEvent[];
}

export interface TaskSummary {
  totalCount: number;
  activeCount: number;
  readyToConvertCount: number;
  unassignedCount: number;
  blockedCount: number;
  criticalCount: number;
  agedCount: number;
}

export interface ReadyToConvertItem {
  id: number;
  title: string;
  source: string;
  summaryShort: string;
  priorityReviewed: TaskPriority;
  reviewedCategory: string | null;
  reviewedNextAction: string | null;
  triageStatus: TriageStatus;
  lastActivityAt: string;
  ageHours: number;
}

export type TaskAgeBucket = "all" | "fresh" | "aging" | "stale";

export type TaskSort = "priority" | "oldest" | "recent";

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  owner?: string;
  ageBucket?: TaskAgeBucket;
  sort?: TaskSort;
}

export interface CreateTaskFromInboxInput {
  originInboxId: number;
  title?: string;
  ownerName?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  contextNote?: string | null;
}

export interface UpdateTaskMetaInput {
  ownerName?: string | null;
  priority?: TaskPriority;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
  movementNote?: string | null;
}

export type CreateTaskFromInboxResult =
  | {
      ok: true;
      task: TaskDetail;
    }
  | {
      ok: false;
      code: "origin-not-found" | "origin-already-active";
    };
