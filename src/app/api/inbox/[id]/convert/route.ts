import { NextResponse } from "next/server";

import { createTaskFromInbox } from "@/db/queries/tasks";
import { createTaskFromInboxSchema } from "@/lib/validation/tasks";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid inbox id" }, { status: 400 });
  }

  const json = await readJson(request);

  if (!json || typeof json !== "object") {
    return NextResponse.json({ error: "Invalid task payload" }, { status: 400 });
  }

  const payload = json as Record<string, unknown>;
  const bodyOrigin = payload.originInboxId;

  if (bodyOrigin !== undefined && Number(bodyOrigin) !== numericId) {
    return NextResponse.json({ error: "Invalid inbox id" }, { status: 400 });
  }

  const parsed = createTaskFromInboxSchema.safeParse({
    ...payload,
    originInboxId: numericId
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task payload" }, { status: 400 });
  }

  const result = await createTaskFromInbox(parsed.data);

  if (!result.ok && result.code === "origin-not-found") {
    return NextResponse.json({ error: "Inbox item not found" }, { status: 404 });
  }

  if (!result.ok && result.code === "origin-already-active") {
    return NextResponse.json(
      { error: "Inbox item already has an active task" },
      { status: 409 }
    );
  }

  if (!result.ok) {
    return NextResponse.json({ error: "Invalid task payload" }, { status: 400 });
  }

  return NextResponse.json(result.task, { status: 201 });
}
