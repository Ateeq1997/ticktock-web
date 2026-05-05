import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { timesheets } from "@/lib/store";
import { formatDateRange } from "@/lib/dateUtils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "5");

  let filtered = [...timesheets];
  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const result = paginated.map((t) => ({
    ...t,
    dateRange: formatDateRange(t.startDate, t.endDate),
    totalHours: t.entries.reduce((s, e) => s + e.hours, 0),
  }));

  return NextResponse.json({ data: result, total, totalPages, page, perPage });
}
