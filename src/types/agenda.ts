import type { InboxPriority } from "@/types/inbox";
import type { TaskPriority, TaskStatus } from "@/types/tasks";

export const AGENDA_LINKED_TYPES = ["inbox", "task"] as const;

export type AgendaLinkedType = (typeof AGENDA_LINKED_TYPES)[number];

export const AGENDA_KINDS = [
  "follow_up",
  "deadline",
  "commitment"
] as const;

export type AgendaKind = (typeof AGENDA_KINDS)[number];

export const AGENDA_STATUSES = ["Aberto", "Concluido", "Cancelado"] as const;

export type AgendaStatus = (typeof AGENDA_STATUSES)[number];

export const AGENDA_URGENCY_STATES = [
  "vencido",
  "hoje",
  "proximo",
  "futuro"
] as const;

export type AgendaUrgencyState = (typeof AGENDA_URGENCY_STATES)[number];

export type AgendaOriginPriority = InboxPriority | TaskPriority;

export interface AgendaOriginSnapshot {
  linkedType: AgendaLinkedType;
  linkedId: number;
  title: string;
  sourceLabel: string;
  summary: string;
  priority: AgendaOriginPriority;
  ownerName: string | null;
  statusLabel: string;
}

export type AgendaTimelineEventType =
  | "created"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "updated";

export interface AgendaTimelineEvent {
  type: AgendaTimelineEventType;
  at: string;
  note: string;
  fromStatus?: AgendaStatus;
  toStatus?: AgendaStatus;
  fromDueAt?: string;
  toDueAt?: string;
}

export interface AgendaListItem {
  id: number;
  linkedType: AgendaLinkedType;
  linkedId: number;
  title: string;
  kind: AgendaKind;
  dueAt: string;
  status: AgendaStatus;
  ownerName: string | null;
  notes: string | null;
  originTitle: string;
  originSourceLabel: string;
  originSummary: string;
  originPriority: AgendaOriginPriority;
  originStatusLabel: string;
  urgencyState: AgendaUrgencyState;
  createdAt: string;
  updatedAt: string;
}

export interface AgendaDetail extends AgendaListItem {
  originSnapshot: AgendaOriginSnapshot;
  timeline: AgendaTimelineEvent[];
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface AgendaSummary {
  totalCount: number;
  activeCount: number;
  overdueCount: number;
  dueTodayCount: number;
  upcomingCount: number;
  futureCount: number;
  completedCount: number;
  cancelledCount: number;
  criticalItems: Array<{
    id: number;
    title: string;
    dueAt: string;
    urgencyState: AgendaUrgencyState;
  }>;
}

export type AgendaSort = "urgency" | "dueAt" | "recent";

export interface AgendaFilters {
  linkedType?: AgendaLinkedType;
  kind?: AgendaKind;
  status?: AgendaStatus;
  urgencyState?: AgendaUrgencyState;
  owner?: string;
  sort?: AgendaSort;
}

export interface CreateAgendaItemInput {
  linkedType: AgendaLinkedType;
  linkedId: number;
  kind: AgendaKind;
  title?: string;
  dueAt: string;
  ownerName?: string | null;
  notes?: string | null;
}

export interface UpdateAgendaItemInput {
  kind?: AgendaKind;
  title?: string;
  dueAt?: string;
  ownerName?: string | null;
  notes?: string | null;
}

export interface UpdateAgendaStatusInput {
  status: AgendaStatus;
  movementNote?: string | null;
}

export type CreateAgendaItemResult =
  | {
      ok: true;
      item: AgendaDetail;
    }
  | {
      ok: false;
      code: "linked-origin-not-found" | "active-duplicate";
    };

export type AgendaTaskOriginStatus = TaskStatus;
