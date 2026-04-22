import { NextResponse } from "next/server";
import { z } from "zod";

import { getInboxItemById, saveInboxTriageSuggestion } from "@/db/queries/inbox";
import { triageInboxItem } from "@/lib/triage/service";

const triageRequestSchema = z.object({
  inboxId: z.number().int().positive()
});

export async function POST(request: Request) {
  const payload = triageRequestSchema.parse(await request.json());
  const item = await getInboxItemById(payload.inboxId);

  if (!item) {
    return NextResponse.json({ error: "Inbox item not found" }, { status: 404 });
  }

  const suggestion = await triageInboxItem(item);
  const updatedItem = await saveInboxTriageSuggestion(payload.inboxId, suggestion);

  return NextResponse.json({ item: updatedItem, suggestion });
}
