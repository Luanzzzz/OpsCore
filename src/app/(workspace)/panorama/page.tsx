import { WorkspaceShell } from "@/components/panorama/workspace-shell";
import { getOperationalPanorama } from "@/db/queries/panorama";

export default async function PanoramaWorkspacePage() {
  const panorama = await getOperationalPanorama();

  return <WorkspaceShell initialPanorama={panorama} />;
}
