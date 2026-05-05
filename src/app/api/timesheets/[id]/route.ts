import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { timesheets } from "@/lib/store";
import { formatDateRange } from "@/lib/dateUtils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ts = timesheets.find((t) => t.id === params.id);
  if (!ts) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      ...ts,
      dateRange: formatDateRange(ts.startDate, ts.endDate),
      totalHours: ts.entries.reduce((s, e) => s + e.hours, 0),
    },
  });
}
