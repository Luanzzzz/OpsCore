import type {
  OperationalPanorama,
  PanoramaContextPacket
} from "@/types/panorama";

export function buildPanoramaContextPacket(
  panorama: Omit<OperationalPanorama, "contextPacket">
): PanoramaContextPacket {
  return {
    version: "v1",
    modules: panorama.modules.map((module) => ({
      id: module.id,
      totalCount: module.totalCount,
      activeCount: module.activeCount,
      pressureCount: module.pressureCount
    })),
    signals: panorama.signals.map((signal) => ({
      id: signal.id,
      moduleId: signal.moduleId,
      severity: signal.severity,
      title: signal.title,
      count: signal.count
    })),
    readiness: {
      intelligence: panorama.intelligenceReadiness,
      integration: panorama.integrationReadiness
    },
    nextMilestoneOptions: panorama.nextMilestoneOptions.map((option) => ({
      id: option.id,
      direction: option.direction,
      evidence: option.evidence,
      readiness: option.readiness
    }))
  };
}
