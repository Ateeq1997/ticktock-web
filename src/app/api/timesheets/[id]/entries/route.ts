import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { timesheets, computeStatus } from "@/lib/store";
import { CreateEntryPayload, TimesheetEntry } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ts = timesheets.find((t) => t.id === params.id);
  if (!ts) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: ts.entries });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tsIndex = timesheets.findIndex((t) => t.id === params.id);
  if (tsIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body: CreateEntryPayload = await req.json();

  // Validation
  const errors: Record<string, string> = {};
  if (!body.task?.trim()) errors.task = "Task description is required";
  if (!body.project?.trim()) errors.project = "Project is required";
  if (!body.workType?.trim()) errors.workType = "Type of work is required";
  if (!body.date) errors.date = "Date is required";
  if (!body.hours || body.hours < 0.5 || body.hours > 24)
    errors.hours = "Hours must be between 0.5 and 24";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  const newEntry: TimesheetEntry = {
    id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timesheetId: params.id,
    date: body.date,
    task: body.task.trim(),
    project: body.project.trim(),
    workType: body.workType.trim(),
    hours: body.hours,
    note: body.note?.trim() || undefined,
  };

  timesheets[tsIndex].entries.push(newEntry);
  timesheets[tsIndex].status = computeStatus(timesheets[tsIndex].entries);

  return NextResponse.json({ data: newEntry }, { status: 201 });
}
