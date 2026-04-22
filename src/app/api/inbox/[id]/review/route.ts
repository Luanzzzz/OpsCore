import { NextResponse } from "next/server";

import { reviewInboxItem } from "@/db/queries/inbox";
import { triageReviewSchema } from "@/lib/validation/inbox";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid inbox id" }, { status: 400 });
  }

  const payload = triageReviewSchema.parse(await request.json());
  const updated = await reviewInboxItem(numericId, payload);

  if (!updated) {
    return NextResponse.json({ error: "Inbox item not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
