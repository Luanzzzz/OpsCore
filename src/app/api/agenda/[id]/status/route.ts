import { NextResponse } from "next/server";

import { updateAgendaStatus } from "@/db/queries/agenda";
import { updateAgendaStatusSchema } from "@/lib/validation/agenda";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseAgendaId(id: string) {
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
  const numericId = parseAgendaId(id);

  if (!numericId) {
    return NextResponse.json({ error: "Invalid agenda id" }, { status: 400 });
  }

  const json = await readJson(request);
  const parsed = updateAgendaStatusSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid agenda payload" },
      { status: 400 }
    );
  }

  const item = await updateAgendaStatus(numericId, parsed.data);

  if (!item) {
    return NextResponse.json({ error: "Agenda item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
