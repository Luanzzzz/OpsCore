import { WorkspaceShell } from "@/components/agenda/workspace-shell";
import {
  getAgendaItemById,
  getAgendaItems,
  getAgendaSummary
} from "@/db/queries/agenda";

export default async function AgendaWorkspacePage() {
  const items = await getAgendaItems();
  const selectedItem = items[0] ? await getAgendaItemById(items[0].id) : null;
  const summary = await getAgendaSummary();

  return (
    <WorkspaceShell
      initialItems={items}
      initialSelectedItem={selectedItem}
      initialSummary={summary}
    />
  );
}
