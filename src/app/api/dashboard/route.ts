import { NextResponse } from "next/server";

import { getDashboardSummary } from "@/db/queries/dashboard";

export async function GET() {
  const summary = await getDashboardSummary();
  return NextResponse.json(summary);
}
