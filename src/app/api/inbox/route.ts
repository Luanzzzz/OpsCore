import { NextRequest, NextResponse } from "next/server";

import { getInboxItems, createInboxItem } from "@/db/queries/inbox";
import {
  createInboxInputSchema,
  inboxFiltersSchema
} from "@/lib/validation/inbox";

export async function GET(request: NextRequest) {
  const filters = inboxFiltersSchema.parse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    priority: request.nextUrl.searchParams.get("priority") ?? undefined
  });

  const items = await getInboxItems(filters);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const json = await request.json();
  const input = createInboxInputSchema.parse(json);
  const item = await createInboxItem(input);

  return NextResponse.json(item, { status: 201 });
}
