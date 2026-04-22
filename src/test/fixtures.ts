import type { AgendaDetail, AgendaListItem, AgendaSummary } from "@/types/agenda";
import type { DashboardSummary, InboxDetail, InboxListItem, TriageReviewInput } from "@/types/inbox";
import type { OperationalPanorama } from "@/types/panorama";
import type {
  ReadyToConvertItem,
  TaskDetail,
  TaskListItem,
  TaskSummary
} from "@/types/tasks";

import { createInboxFactory } from "./factories/inbox";

export const FIXED_NOW = "2026-04-20T12:00:00.000Z";
export const WORKSPACE_NOW = "2026-04-20T10:00:00.000Z";

export function buildReviewedInboxSeed(overrides: {
  createInput?: Partial<ReturnType<typeof createInboxFactory>> & {
    descriptionRaw?: string;
    status?: InboxListItem["status"];
    priorityReviewed?: InboxListItem["priorityReviewed"];
    waitingOnResponse?: boolean;
  };
  reviewInput?: Partial<TriageReviewInput>;
} = {}) {
  return {
    createInput: {
      ...createInboxFactory(),
      descriptionRaw: "Cliente pediu retorno ainda hoje.",
      ...overrides.createInput
    },
    reviewInput: {
      reviewedCategory: "Comercial",
      reviewedNextAction: "Responder cliente",
      priorityReviewed: "Critica",
      status: "Aguardando resposta",
      waitingOnResponse: true,
      ...overrides.reviewInput
    }
  };
}

const inboxItems: InboxListItem[] = [
  {
    id: 1,
    title: "Cliente aguardando resposta",
    source: "WhatsApp",
    summaryShort: "Pedir retorno comercial hoje",
    status: "Aguardando resposta",
    priorityReviewed: "Critica",
    waitingOnResponse: true,
    lastActivityAt: WORKSPACE_NOW,
    triageStatus: "pending"
  },
  {
    id: 2,
    title: "Follow-up interno",
    source: "Email",
    summaryShort: "Revisar estimativa do time",
    status: "Nova",
    priorityReviewed: "Media",
    waitingOnResponse: false,
    lastActivityAt: "2026-04-18T11:00:00.000Z",
    triageStatus: "ready"
  }
];

const inboxDetail: InboxDetail = {
  ...inboxItems[0],
  descriptionRaw: "Cliente pediu retorno antes do fim do dia.",
  aiSuggestion: null,
  reviewedCategory: null,
  reviewedNextAction: null,
  triageReviewedAt: null
};

const inboxDashboard: DashboardSummary = {
  byStatus: [
    { status: "Nova", count: 1 },
    { status: "Em analise", count: 0 },
    { status: "Aguardando resposta", count: 1 },
    { status: "Concluida/Arquivada", count: 0 }
  ],
  highPriorityCount: 1,
  waitingOnResponseCount: 1,
  unreviewedTriageCount: 2,
  oldestItems: [{ id: 1, title: "Cliente aguardando resposta", ageHours: 4 }],
  averageResponseAgeHours: 4
};

export const inboxWorkspaceFixture = {
  items: inboxItems,
  detail: inboxDetail,
  dashboard: inboxDashboard
};

const taskItems: TaskListItem[] = [
  {
    id: 1,
    originInboxId: 10,
    title: "Contrato operacional",
    ownerName: null,
    priority: "Critica",
    status: "Bloqueada",
    originTitle: "Entrada comercial",
    originSource: "email",
    originSummaryShort: "Cliente aprovou contrato.",
    lastMovementAt: WORKSPACE_NOW,
    createdAt: WORKSPACE_NOW,
    updatedAt: WORKSPACE_NOW,
    ageHours: 56
  },
  {
    id: 2,
    originInboxId: 11,
    title: "Checklist de onboarding",
    ownerName: "Luan",
    priority: "Alta",
    status: "Em andamento",
    originTitle: "Pedido interno",
    originSource: "slack",
    originSummaryShort: "Time pediu checklist.",
    lastMovementAt: WORKSPACE_NOW,
    createdAt: WORKSPACE_NOW,
    updatedAt: WORKSPACE_NOW,
    ageHours: 6
  }
];

const taskDetail: TaskDetail = {
  ...taskItems[0],
  contextNote: "Preparar kickoff operacional",
  origin: {
    inboxId: 10,
    title: "Entrada comercial",
    source: "email",
    summaryShort: "Cliente aprovou contrato.",
    reviewedCategory: "Comercial",
    reviewedNextAction: "Preparar kickoff operacional",
    triageStatus: "reviewed"
  },
  timeline: [
    {
      type: "conversion",
      at: WORKSPACE_NOW,
      note: "Tarefa criada a partir do inbox revisado.",
      toStatus: "Bloqueada"
    }
  ]
};

const secondTaskDetail: TaskDetail = {
  ...taskItems[1],
  contextNote: "Executar checklist",
  origin: {
    inboxId: 11,
    title: "Pedido interno",
    source: "slack",
    summaryShort: "Time pediu checklist.",
    reviewedCategory: "Operacao",
    reviewedNextAction: "Executar checklist",
    triageStatus: "reviewed"
  },
  timeline: [
    {
      type: "conversion",
      at: WORKSPACE_NOW,
      note: "Tarefa criada a partir do inbox revisado.",
      toStatus: "Em andamento"
    }
  ]
};

const readyToConvert: ReadyToConvertItem[] = [
  {
    id: 12,
    title: "Nova entrada revisada",
    source: "whatsapp",
    summaryShort: "Cliente pediu execucao imediata.",
    priorityReviewed: "Alta",
    reviewedCategory: "Operacao",
    reviewedNextAction: "Converter e atribuir responsavel",
    triageStatus: "reviewed",
    lastActivityAt: WORKSPACE_NOW,
    ageHours: 2
  }
];

const taskSummary: TaskSummary = {
  totalCount: 2,
  activeCount: 2,
  readyToConvertCount: 1,
  unassignedCount: 1,
  blockedCount: 1,
  criticalCount: 1,
  agedCount: 1
};

export const executionWorkspaceFixture = {
  items: taskItems,
  detail: taskDetail,
  secondDetail: secondTaskDetail,
  readyToConvert,
  summary: taskSummary
};

const agendaItems: AgendaListItem[] = [
  {
    id: 1,
    linkedType: "task",
    linkedId: 10,
    title: "Retomar contrato",
    kind: "follow_up",
    dueAt: "2026-04-20T18:00:00.000Z",
    status: "Aberto",
    ownerName: "Luan",
    notes: "Validar retorno do cliente.",
    originTitle: "Contrato operacional",
    originSourceLabel: "email",
    originSummary: "Cliente aprovou contrato.",
    originPriority: "Critica",
    originStatusLabel: "Bloqueada",
    urgencyState: "hoje",
    createdAt: WORKSPACE_NOW,
    updatedAt: WORKSPACE_NOW
  },
  {
    id: 2,
    linkedType: "inbox",
    linkedId: 11,
    title: "Enviar proposta",
    kind: "deadline",
    dueAt: "2026-04-19T18:00:00.000Z",
    status: "Aberto",
    ownerName: null,
    notes: null,
    originTitle: "Entrada comercial",
    originSourceLabel: "whatsapp",
    originSummary: "Cliente pediu proposta.",
    originPriority: "Alta",
    originStatusLabel: "Em analise",
    urgencyState: "vencido",
    createdAt: WORKSPACE_NOW,
    updatedAt: WORKSPACE_NOW
  }
];

const agendaDetail: AgendaDetail = {
  ...agendaItems[0],
  completedAt: null,
  cancelledAt: null,
  originSnapshot: {
    linkedType: "task",
    linkedId: 10,
    title: "Contrato operacional",
    sourceLabel: "email",
    summary: "Cliente aprovou contrato.",
    priority: "Critica",
    ownerName: "Luan",
    statusLabel: "Bloqueada"
  },
  timeline: [
    {
      type: "created",
      at: WORKSPACE_NOW,
      note: "Item de agenda criado.",
      toStatus: "Aberto"
    }
  ]
};

const secondAgendaDetail: AgendaDetail = {
  ...agendaItems[1],
  completedAt: null,
  cancelledAt: null,
  originSnapshot: {
    linkedType: "inbox",
    linkedId: 11,
    title: "Entrada comercial",
    sourceLabel: "whatsapp",
    summary: "Cliente pediu proposta.",
    priority: "Alta",
    ownerName: null,
    statusLabel: "Em analise"
  },
  timeline: [
    {
      type: "created",
      at: WORKSPACE_NOW,
      note: "Item de agenda criado.",
      toStatus: "Aberto"
    }
  ]
};

const agendaSummary: AgendaSummary = {
  activeCount: 2,
  cancelledCount: 0,
  completedCount: 0,
  criticalItems: [
    {
      id: 2,
      title: "Enviar proposta",
      dueAt: "2026-04-19T18:00:00.000Z",
      urgencyState: "vencido"
    }
  ],
  dueTodayCount: 1,
  futureCount: 0,
  overdueCount: 1,
  totalCount: 2,
  upcomingCount: 0
};

const agendaInboxDetail: InboxDetail = {
  aiSuggestion: null,
  descriptionRaw: "Cliente pediu proposta detalhada.",
  id: 11,
  lastActivityAt: WORKSPACE_NOW,
  priorityReviewed: "Alta",
  reviewedCategory: "Comercial",
  reviewedNextAction: "Enviar proposta revisada",
  source: "whatsapp",
  status: "Em analise",
  summaryShort: "Cliente pediu proposta.",
  title: "Entrada comercial",
  triageReviewedAt: WORKSPACE_NOW,
  triageStatus: "reviewed",
  waitingOnResponse: false
};

export const agendaWorkspaceFixture = {
  items: agendaItems,
  detail: agendaDetail,
  secondDetail: secondAgendaDetail,
  summary: agendaSummary,
  inboxDetail: agendaInboxDetail
};

const panorama: OperationalPanorama = {
  modules: [
    {
      activeCount: 3,
      counters: [{ label: "Aguardando resposta", value: 1 }],
      id: "inbox",
      label: "Inbox",
      pressureCount: 2,
      route: "/inbox",
      summary: "Entradas e respostas pendentes.",
      totalCount: 4
    },
    {
      activeCount: 2,
      counters: [{ label: "Bloqueadas", value: 1 }],
      id: "execution",
      label: "Tarefas",
      pressureCount: 3,
      route: "/execucao",
      summary: "Backlog e bloqueios.",
      totalCount: 2
    },
    {
      activeCount: 2,
      counters: [{ label: "Vencidos", value: 1 }],
      id: "agenda",
      label: "Agenda",
      pressureCount: 1,
      route: "/agenda",
      summary: "Prazos e follow-ups.",
      totalCount: 2
    }
  ],
  signals: [
    {
      count: 1,
      detail: "1 tarefa bloqueia a execucao.",
      id: "execution-blocked",
      moduleId: "execution",
      severity: "critical",
      targetRoute: "/execucao",
      title: "Tarefas bloqueadas"
    },
    {
      count: 1,
      detail: "1 item de agenda passou do prazo.",
      id: "agenda-overdue",
      moduleId: "agenda",
      severity: "critical",
      targetRoute: "/agenda",
      title: "Agenda vencida"
    }
  ],
  intelligenceReadiness: {
    availableSignals: ["context packet resumido", "sinais de pressao"],
    contextPacketVersion: "v1",
    missingSignals: ["feedback humano estruturado"],
    status: "preparing"
  },
  integrationReadiness: {
    availableSignals: ["origem vinculada entre dominios"],
    missingSignals: ["politica de sincronizacao externa"],
    status: "preparing"
  },
  contextPacket: {
    modules: [],
    nextMilestoneOptions: [],
    readiness: {
      integration: {
        availableSignals: ["origem vinculada entre dominios"],
        missingSignals: ["politica de sincronizacao externa"],
        status: "preparing"
      },
      intelligence: {
        availableSignals: ["context packet resumido", "sinais de pressao"],
        contextPacketVersion: "v1",
        missingSignals: ["feedback humano estruturado"],
        status: "preparing"
      }
    },
    signals: [],
    version: "v1"
  },
  nextMilestoneOptions: [
    {
      direction: "stronger-intelligence",
      evidence: ["execution-blocked", "agenda-overdue"],
      id: "milestone-stronger-intelligence",
      rationale: "Priorizar proximas acoes com revisao humana.",
      readiness: "high",
      title: "Inteligencia operacional mais forte"
    }
  ]
};

export const panoramaWorkspaceFixture = {
  panorama
};
