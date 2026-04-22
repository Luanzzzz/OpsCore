import { NextResponse } from "next/server";

import { getOperationalPanorama } from "@/db/queries/panorama";

export async function GET() {
  const panorama = await getOperationalPanorama();
  return NextResponse.json(panorama);
}
