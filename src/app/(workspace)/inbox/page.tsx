import { getDashboardSummary } from "@/db/queries/dashboard";
import { getInboxItemById, getInboxItems } from "@/db/queries/inbox";
import { WorkspaceShell } from "@/components/inbox/workspace-shell";

export default async function InboxWorkspacePage() {
  const items = await getInboxItems();
  const selectedItem = items[0] ? await getInboxItemById(items[0].id) : null;
  const dashboard = await getDashboardSummary();

  return (
    <WorkspaceShell
      initialDashboard={dashboard}
      initialItems={items}
      initialSelectedItem={selectedItem}
    />
  );
}
