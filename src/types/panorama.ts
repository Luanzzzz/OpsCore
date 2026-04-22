export const PANORAMA_MODULES = [
  { id: "inbox", label: "Inbox", route: "/inbox" },
  { id: "execution", label: "Tarefas", route: "/execucao" },
  { id: "agenda", label: "Agenda", route: "/agenda" }
] as const;

export type PanoramaModuleId = (typeof PANORAMA_MODULES)[number]["id"];

export type PanoramaSignalSeverity = "critical" | "warning" | "info";

export type PanoramaMilestoneDirection =
  | "stronger-intelligence"
  | "external-channels"
  | "operational-hardening";

export interface PanoramaModuleState {
  id: PanoramaModuleId;
  label: string;
  route: string;
  totalCount: number;
  activeCount: number;
  pressureCount: number;
  summary: string;
  counters: Array<{
    label: string;
    value: number;
  }>;
}

export interface PanoramaSignal {
  id: string;
  moduleId: PanoramaModuleId;
  severity: PanoramaSignalSeverity;
  title: string;
  detail: string;
  count: number;
  targetRoute: string;
}

export interface IntelligenceReadinessSnapshot {
  status: "preparing";
  availableSignals: string[];
  missingSignals: string[];
  contextPacketVersion: "v1";
}

export interface IntegrationReadinessSnapshot {
  status: "preparing";
  availableSignals: string[];
  missingSignals: string[];
}

export interface NextMilestoneOption {
  id: string;
  direction: PanoramaMilestoneDirection;
  title: string;
  rationale: string;
  evidence: string[];
  readiness: "low" | "medium" | "high";
}

export interface PanoramaContextPacket {
  version: "v1";
  modules: Array<{
    id: PanoramaModuleId;
    totalCount: number;
    activeCount: number;
    pressureCount: number;
  }>;
  signals: Array<{
    id: string;
    moduleId: PanoramaModuleId;
    severity: PanoramaSignalSeverity;
    title: string;
    count: number;
  }>;
  readiness: {
    intelligence: IntelligenceReadinessSnapshot;
    integration: IntegrationReadinessSnapshot;
  };
  nextMilestoneOptions: Array<{
    id: string;
    direction: PanoramaMilestoneDirection;
    evidence: string[];
    readiness: NextMilestoneOption["readiness"];
  }>;
}

export interface OperationalPanorama {
  modules: PanoramaModuleState[];
  signals: PanoramaSignal[];
  intelligenceReadiness: IntelligenceReadinessSnapshot;
  integrationReadiness: IntegrationReadinessSnapshot;
  contextPacket: PanoramaContextPacket;
  nextMilestoneOptions: NextMilestoneOption[];
}
