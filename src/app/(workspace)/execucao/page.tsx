import { WorkspaceShell } from "@/components/execution/workspace-shell";
import {
  getExecutionSummary,
  getReadyToConvertItems,
  getTaskById,
  getTasks
} from "@/db/queries/tasks";

export default async function ExecutionWorkspacePage() {
  const items = await getTasks();
  const selectedItem = items[0] ? await getTaskById(items[0].id) : null;
  const summary = await getExecutionSummary();
  const readyToConvert = await getReadyToConvertItems();

  return (
    <WorkspaceShell
      initialItems={items}
      initialReadyToConvert={readyToConvert}
      initialSelectedItem={selectedItem}
      initialSummary={summary}
    />
  );
}
