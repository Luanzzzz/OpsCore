import { NextRequest, NextResponse } from "next/server";

import {
  getExecutionSummary,
  getReadyToConvertItems,
  getTasks
} from "@/db/queries/tasks";
import { taskFiltersSchema } from "@/lib/validation/tasks";

export async function GET(request: NextRequest) {
  const parsed = taskFiltersSchema.safeParse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    priority: request.nextUrl.searchParams.get("priority") ?? undefined,
    owner: request.nextUrl.searchParams.get("owner") ?? undefined,
    ageBucket: request.nextUrl.searchParams.get("ageBucket") ?? undefined,
    sort: request.nextUrl.searchParams.get("sort") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task filters" }, { status: 400 });
  }

  const [items, summary, readyToConvert] = await Promise.all([
    getTasks(parsed.data),
    getExecutionSummary(),
    getReadyToConvertItems()
  ]);

  return NextResponse.json({ items, summary, readyToConvert });
}
