import { NextResponse } from "next/server";

import { updateTaskStatus } from "@/db/queries/tasks";
import { updateTaskStatusSchema } from "@/lib/validation/tasks";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseTaskId(id: string) {
  const numericId = Number(id);
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = parseTaskId(id);

  if (!numericId) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const json = await readJson(request);
  const parsed = updateTaskStatusSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task payload" }, { status: 400 });
  }

  const task = await updateTaskStatus(numericId, parsed.data);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}
