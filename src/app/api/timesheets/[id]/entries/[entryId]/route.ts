import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { timesheets, computeStatus } from "@/lib/store";
import { UpdateEntryPayload } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tsIndex = timesheets.findIndex((t) => t.id === params.id);
  if (tsIndex === -1) return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });

  const entryIndex = timesheets[tsIndex].entries.findIndex((e) => e.id === params.entryId);
  if (entryIndex === -1) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  const body: UpdateEntryPayload = await req.json();

  const errors: Record<string, string> = {};
  if (body.task !== undefined && !body.task.trim()) errors.task = "Task cannot be empty";
  if (body.hours !== undefined && (body.hours < 0.5 || body.hours > 24))
    errors.hours = "Hours must be between 0.5 and 24";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  timesheets[tsIndex].entries[entryIndex] = {
    ...timesheets[tsIndex].entries[entryIndex],
    ...(body.task && { task: body.task.trim() }),
    ...(body.project && { project: body.project.trim() }),
    ...(body.workType && { workType: body.workType.trim() }),
    ...(body.hours && { hours: body.hours }),
    ...(body.date && { date: body.date }),
    ...(body.note !== undefined && { note: body.note }),
  };

  timesheets[tsIndex].status = computeStatus(timesheets[tsIndex].entries);

  return NextResponse.json({ data: timesheets[tsIndex].entries[entryIndex] });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tsIndex = timesheets.findIndex((t) => t.id === params.id);
  if (tsIndex === -1) return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });

  const before = timesheets[tsIndex].entries.length;
  timesheets[tsIndex].entries = timesheets[tsIndex].entries.filter(
    (e) => e.id !== params.entryId
  );

  if (timesheets[tsIndex].entries.length === before) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  timesheets[tsIndex].status = computeStatus(timesheets[tsIndex].entries);

  return NextResponse.json({ data: { success: true } });
}
