export type InboxStatus =
  | "Nova"
  | "Em analise"
  | "Aguardando resposta"
  | "Concluida/Arquivada";

export type InboxPriority = "Baixa" | "Media" | "Alta" | "Critica";

export type TriageStatus = "pending" | "ready" | "reviewed";

export interface TriageSuggestion {
  category: string;
  urgency: InboxPriority;
  nextAction: string;
  summary: string;
  rationale: string;
}

export interface InboxListItem {
  id: number;
  title: string;
  source: string;
  summaryShort: string;
  status: InboxStatus;
  priorityReviewed: InboxPriority;
  waitingOnResponse: boolean;
  lastActivityAt: string;
  triageStatus: TriageStatus;
}

export interface InboxDetail extends InboxListItem {
  descriptionRaw: string;
  aiSuggestion: TriageSuggestion | null;
  reviewedCategory: string | null;
  reviewedNextAction: string | null;
  triageReviewedAt: string | null;
}

export interface DashboardSummary {
  byStatus: Array<{ status: InboxStatus; count: number }>;
  highPriorityCount: number;
  waitingOnResponseCount: number;
  unreviewedTriageCount: number;
  oldestItems: Array<{ id: number; title: string; ageHours: number }>;
  averageResponseAgeHours: number;
}

export interface CreateInboxInput {
  title: string;
  source: string;
  summaryShort: string;
  descriptionRaw?: string;
  status?: InboxStatus;
  priorityReviewed?: InboxPriority;
  waitingOnResponse?: boolean;
}

export interface InboxFilters {
  status?: InboxStatus;
  priority?: InboxPriority;
}

export interface TriageReviewInput {
  reviewedCategory?: string | null;
  reviewedNextAction?: string | null;
  priorityReviewed?: InboxPriority;
  status?: InboxStatus;
  waitingOnResponse?: boolean;
}
