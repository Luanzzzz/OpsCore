import { getAgendaSummary } from "@/db/queries/agenda";
import { getDashboardSummary } from "@/db/queries/inbox";
import { getExecutionSummary } from "@/db/queries/tasks";
import { buildPanoramaContextPacket } from "@/lib/intelligence/context-packet";
import type {
  NextMilestoneOption,
  OperationalPanorama,
  PanoramaModuleState,
  PanoramaSignal,
  PanoramaSignalSeverity
} from "@/types/panorama";

function orderSignals(signals: PanoramaSignal[]) {
  const weight: Record<PanoramaSignalSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2
  };

  return [...signals]
    .sort((left, right) => {
      const severityDelta = weight[left.severity] - weight[right.severity];

      if (severityDelta !== 0) {
        return severityDelta;
      }

      return right.count - left.count;
    })
    .slice(0, 8);
}

export async function getOperationalPanorama(): Promise<OperationalPanorama> {
  const [dashboard, execution, agenda] = await Promise.all([
    getDashboardSummary(),
    getExecutionSummary(),
    getAgendaSummary()
  ]);

  const inboxTotal = dashboard.byStatus.reduce(
    (total, item) => total + item.count,
    0
  );
  const inboxClosed =
    dashboard.byStatus.find((item) => item.status === "Concluida/Arquivada")
      ?.count ?? 0;
  const inboxActive = inboxTotal - inboxClosed;
  const inboxPressure =
    dashboard.highPriorityCount +
    dashboard.waitingOnResponseCount +
    dashboard.unreviewedTriageCount;
  const executionPressure =
    execution.blockedCount + execution.unassignedCount + execution.criticalCount;
  const agendaPressure =
    agenda.overdueCount + agenda.dueTodayCount + agenda.upcomingCount;

  const modules: PanoramaModuleState[] = [
    {
      id: "inbox",
      label: "Inbox",
      route: "/inbox",
      totalCount: inboxTotal,
      activeCount: inboxActive,
      pressureCount: inboxPressure,
      summary: "Entradas, triagem e respostas pendentes.",
      counters: [
        { label: "Alta prioridade", value: dashboard.highPriorityCount },
        { label: "Aguardando resposta", value: dashboard.waitingOnResponseCount },
        { label: "Triagem pendente", value: dashboard.unreviewedTriageCount }
      ]
    },
    {
      id: "execution",
      label: "Tarefas",
      route: "/execucao",
      totalCount: execution.totalCount,
      activeCount: execution.activeCount,
      pressureCount: executionPressure,
      summary: "Backlog, responsaveis e bloqueios de execucao.",
      counters: [
        { label: "Bloqueadas", value: execution.blockedCount },
        { label: "Sem responsavel", value: execution.unassignedCount },
        { label: "Criticas", value: execution.criticalCount }
      ]
    },
    {
      id: "agenda",
      label: "Agenda",
      route: "/agenda",
      totalCount: agenda.totalCount,
      activeCount: agenda.activeCount,
      pressureCount: agendaPressure,
      summary: "Prazos, follow-ups e compromissos abertos.",
      counters: [
        { label: "Vencidos", value: agenda.overdueCount },
        { label: "Hoje", value: agenda.dueTodayCount },
        { label: "Proximos", value: agenda.upcomingCount }
      ]
    }
  ];

  const signals = orderSignals([
    ...(dashboard.waitingOnResponseCount > 0
      ? [
          {
            id: "inbox-waiting-response",
            moduleId: "inbox" as const,
            severity: "warning" as const,
            title: "Respostas pendentes no inbox",
            detail: `${dashboard.waitingOnResponseCount} entrada(s) aguardam retorno.`,
            count: dashboard.waitingOnResponseCount,
            targetRoute: "/inbox"
          }
        ]
      : []),
    ...(dashboard.unreviewedTriageCount > 0
      ? [
          {
            id: "inbox-unreviewed-triage",
            moduleId: "inbox" as const,
            severity: "info" as const,
            title: "Triagem humana pendente",
            detail: `${dashboard.unreviewedTriageCount} entrada(s) ainda precisam de revisao.`,
            count: dashboard.unreviewedTriageCount,
            targetRoute: "/inbox"
          }
        ]
      : []),
    ...(execution.blockedCount > 0
      ? [
          {
            id: "execution-blocked",
            moduleId: "execution" as const,
            severity: "critical" as const,
            title: "Tarefas bloqueadas",
            detail: `${execution.blockedCount} tarefa(s) bloqueiam a execucao.`,
            count: execution.blockedCount,
            targetRoute: "/execucao"
          }
        ]
      : []),
    ...(execution.unassignedCount > 0
      ? [
          {
            id: "execution-unassigned",
            moduleId: "execution" as const,
            severity: "warning" as const,
            title: "Tarefas sem responsavel",
            detail: `${execution.unassignedCount} tarefa(s) ativas estao sem dono.`,
            count: execution.unassignedCount,
            targetRoute: "/execucao"
          }
        ]
      : []),
    ...(agenda.overdueCount > 0
      ? [
          {
            id: "agenda-overdue",
            moduleId: "agenda" as const,
            severity: "critical" as const,
            title: "Agenda vencida",
            detail: `${agenda.overdueCount} item(ns) de agenda passaram do prazo.`,
            count: agenda.overdueCount,
            targetRoute: "/agenda"
          }
        ]
      : []),
    ...(agenda.upcomingCount > 0
      ? [
          {
            id: "agenda-upcoming",
            moduleId: "agenda" as const,
            severity: "info" as const,
            title: "Agenda proxima",
            detail: `${agenda.upcomingCount} compromisso(s) entram na janela de 72h.`,
            count: agenda.upcomingCount,
            targetRoute: "/agenda"
          }
        ]
      : [])
  ]);

  const intelligenceReadiness = {
    status: "preparing" as const,
    availableSignals: [
      "contadores de inbox",
      "estado de execucao",
      "pressao temporal de agenda",
      "context packet resumido"
    ],
    missingSignals: [
      "avaliacao historica de resultados",
      "feedback humano estruturado para recomendacoes"
    ],
    contextPacketVersion: "v1" as const
  };
  const integrationReadiness = {
    status: "preparing" as const,
    availableSignals: [
      "rotas internas consolidadas",
      "origem vinculada entre dominios",
      "sinais de pressao operacional"
    ],
    missingSignals: [
      "credenciais de canais externos",
      "mapeamento de permissao por origem",
      "politica de sincronizacao externa"
    ]
  };
  const nextMilestoneOptions: NextMilestoneOption[] = [
    {
      id: "milestone-stronger-intelligence",
      direction: "stronger-intelligence",
      title: "Inteligencia operacional mais forte",
      rationale:
        "Usar os sinais consolidados para priorizar proximas acoes com revisao humana.",
      evidence: signals.map((signal) => signal.id).slice(0, 4),
      readiness: signals.length >= 3 ? "high" : "medium"
    },
    {
      id: "milestone-external-channels",
      direction: "external-channels",
      title: "Canais externos com governanca",
      rationale:
        "Preparar entradas de fora do app sem perder origem, permissao e rastreio.",
      evidence: [
        "origem vinculada entre inbox, tarefas e agenda",
        "payload de panorama sem dados crus",
        "necessidade de politica de sincronizacao externa"
      ],
      readiness: "medium"
    }
  ];
  const panoramaWithoutPacket = {
    modules,
    signals,
    intelligenceReadiness,
    integrationReadiness,
    nextMilestoneOptions
  };

  return {
    ...panoramaWithoutPacket,
    contextPacket: buildPanoramaContextPacket(panoramaWithoutPacket)
  };
}
