import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { timesheets } from "@/lib/store";
import { formatDateRange } from "@/lib/dateUtils";

type SortField = "week" | "date" | "status" | "hours";
type SortOrder = "asc" | "desc";

const validSortFields: SortField[] = ["week", "date", "status", "hours"];
const validSortOrders: SortOrder[] = ["asc", "desc"];

const statusRank = {
  COMPLETED: 0,
  INCOMPLETE: 1,
  MISSING: 2,
} as const;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const query = searchParams.get("query")?.trim().toLowerCase() || "";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "5");
  const sortBy = validSortFields.includes((searchParams.get("sortBy") as SortField) || "week")
    ? ((searchParams.get("sortBy") as SortField) || "week")
    : "week";
  const sortOrder = validSortOrders.includes((searchParams.get("sortOrder") as SortOrder) || "desc")
    ? ((searchParams.get("sortOrder") as SortOrder) || "desc")
    : "desc";

  let filtered = timesheets.map((timesheet) => ({
    ...timesheet,
    dateRange: formatDateRange(timesheet.startDate, timesheet.endDate),
    totalHours: timesheet.entries.reduce((sum, entry) => sum + entry.hours, 0),
  }));

  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  if (query) {
    filtered = filtered.filter((timesheet) => {
      const haystack = [
        `week ${timesheet.weekNumber}`,
        timesheet.dateRange,
        timesheet.status,
        ...timesheet.entries.flatMap((entry) => [entry.task, entry.project, entry.workType, entry.note || ""]),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  filtered.sort((left, right) => {
    const direction = sortOrder === "asc" ? 1 : -1;

    switch (sortBy) {
      case "date":
        return left.startDate.localeCompare(right.startDate) * direction;
      case "status":
        return (statusRank[left.status] - statusRank[right.status]) * direction;
      case "hours":
        return (left.totalHours - right.totalHours) * direction;
      case "week":
      default:
        return (left.weekNumber - right.weekNumber) * direction;
    }
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const summary = filtered.reduce(
    (acc, timesheet) => {
      acc.totalHours += timesheet.totalHours;
      acc[timesheet.status] += 1;
      return acc;
    },
    {
      totalHours: 0,
      COMPLETED: 0,
      INCOMPLETE: 0,
      MISSING: 0,
    }
  );

  return NextResponse.json({
    data: paginated,
    total,
    totalPages,
    page,
    perPage,
    summary,
  });
}
