import { NextResponse } from "next/server";

import { getInboxItemById } from "@/db/queries/inbox";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid inbox id" }, { status: 400 });
  }

  const item = await getInboxItemById(numericId);

  if (!item) {
    return NextResponse.json({ error: "Inbox item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
