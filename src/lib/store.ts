import { Timesheet, TimesheetEntry } from "@/types";

// In-memory store — simulates a database
// In production this would be replaced with a real DB

const createEntries = (
  timesheetId: string,
  dayEntries: { date: string; count: number; hours: number }[]
): TimesheetEntry[] => {
  const entries: TimesheetEntry[] = [];
  const projects = ["Homepage Development", "API Integration", "Mobile Redesign", "Documentation"];
  const workTypes = ["Feature Development", "Bug Fixes", "Code Review", "Testing"];
  let idx = 1;

  for (const { date, count, hours } of dayEntries) {
    for (let i = 0; i < count; i++) {
      entries.push({
        id: `entry-${timesheetId}-${idx++}`,
        timesheetId,
        date,
        task: projects[idx % projects.length],
        project: projects[idx % projects.length],
        workType: workTypes[idx % workTypes.length],
        hours,
      });
    }
  }
  return entries;
};

export let timesheets: Timesheet[] = [
  {
    id: "week-1",
    weekNumber: 1,
    startDate: "2024-01-01",
    endDate: "2024-01-05",
    status: "COMPLETED",
    entries: createEntries("week-1", [
      { date: "2024-01-01", count: 2, hours: 4 },
      { date: "2024-01-02", count: 2, hours: 4 },
      { date: "2024-01-03", count: 2, hours: 4 },
      { date: "2024-01-04", count: 2, hours: 4 },
      { date: "2024-01-05", count: 2, hours: 4 },
    ]),
  },
  {
    id: "week-2",
    weekNumber: 2,
    startDate: "2024-01-08",
    endDate: "2024-01-12",
    status: "COMPLETED",
    entries: createEntries("week-2", [
      { date: "2024-01-08", count: 2, hours: 4 },
      { date: "2024-01-09", count: 2, hours: 4 },
      { date: "2024-01-10", count: 2, hours: 4 },
      { date: "2024-01-11", count: 2, hours: 4 },
      { date: "2024-01-12", count: 2, hours: 4 },
    ]),
  },
  {
    id: "week-3",
    weekNumber: 3,
    startDate: "2024-01-15",
    endDate: "2024-01-19",
    status: "INCOMPLETE",
    entries: createEntries("week-3", [
      { date: "2024-01-15", count: 2, hours: 4 },
      { date: "2024-01-16", count: 3, hours: 4 },
      { date: "2024-01-17", count: 3, hours: 4 },
      { date: "2024-01-18", count: 2, hours: 4 },
    ]),
  },
  {
    id: "week-4",
    weekNumber: 4,
    startDate: "2024-01-22",
    endDate: "2024-01-26",
    status: "COMPLETED",
    entries: createEntries("week-4", [
      { date: "2024-01-22", count: 2, hours: 4 },
      { date: "2024-01-23", count: 2, hours: 4 },
      { date: "2024-01-24", count: 2, hours: 4 },
      { date: "2024-01-25", count: 2, hours: 4 },
      { date: "2024-01-26", count: 2, hours: 4 },
    ]),
  },
  {
    id: "week-5",
    weekNumber: 5,
    startDate: "2024-01-28",
    endDate: "2024-02-01",
    status: "MISSING",
    entries: [],
  },
  {
    id: "week-6",
    weekNumber: 6,
    startDate: "2024-02-05",
    endDate: "2024-02-09",
    status: "MISSING",
    entries: [],
  },
  {
    id: "week-7",
    weekNumber: 7,
    startDate: "2024-02-12",
    endDate: "2024-02-16",
    status: "MISSING",
    entries: [],
  },
];

export const computeStatus = (entries: TimesheetEntry[]): Timesheet["status"] => {
  const total = entries.reduce((s, e) => s + e.hours, 0);
  if (total === 0) return "MISSING";
  if (total >= 40) return "COMPLETED";
  return "INCOMPLETE";
};
