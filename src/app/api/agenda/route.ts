import { NextRequest, NextResponse } from "next/server";

import {
  createAgendaItem,
  getAgendaItems,
  getAgendaSummary
} from "@/db/queries/agenda";
import {
  agendaFiltersSchema,
  createAgendaItemSchema
} from "@/lib/validation/agenda";

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const parsed = agendaFiltersSchema.safeParse({
    linkedType: request.nextUrl.searchParams.get("linkedType") ?? undefined,
    kind: request.nextUrl.searchParams.get("kind") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    urgencyState:
      request.nextUrl.searchParams.get("urgencyState") ?? undefined,
    owner: request.nextUrl.searchParams.get("owner") ?? undefined,
    sort: request.nextUrl.searchParams.get("sort") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid agenda filters" },
      { status: 400 }
    );
  }

  const [items, summary] = await Promise.all([
    getAgendaItems(parsed.data),
    getAgendaSummary()
  ]);

  return NextResponse.json({ items, summary });
}

export async function POST(request: NextRequest) {
  const json = await readJson(request);
  const parsed = createAgendaItemSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid agenda payload" },
      { status: 400 }
    );
  }

  const result = await createAgendaItem(parsed.data);

  if (result.ok) {
    return NextResponse.json(result.item, { status: 201 });
  }

  if (result.code === "linked-origin-not-found") {
    return NextResponse.json(
      { error: "Linked origin not found" },
      { status: 404 }
    );
  }

  if (result.code === "active-duplicate") {
    return NextResponse.json(
      { error: "Agenda item already exists for this origin and due date" },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { error: "Unable to create agenda item" },
    { status: 500 }
  );
}
