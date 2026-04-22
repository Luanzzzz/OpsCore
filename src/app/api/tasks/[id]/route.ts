import { NextResponse } from "next/server";

import { getTaskById, updateTaskMeta } from "@/db/queries/tasks";
import { updateTaskMetaSchema } from "@/lib/validation/tasks";

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

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = parseTaskId(id);

  if (!numericId) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const task = await getTaskById(numericId);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = parseTaskId(id);

  if (!numericId) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const json = await readJson(request);
  const parsed = updateTaskMetaSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task payload" }, { status: 400 });
  }

  const task = await updateTaskMeta(numericId, parsed.data);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}
