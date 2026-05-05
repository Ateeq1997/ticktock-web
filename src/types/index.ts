export type TimesheetStatus = "COMPLETED" | "INCOMPLETE" | "MISSING";

export interface TimesheetEntry {
  id: string;
  timesheetId: string;
  date: string; // ISO date string e.g. "2024-01-21"
  task: string;
  project: string;
  workType: string;
  hours: number;
  note?: string;
}

export interface Timesheet {
  id: string;
  weekNumber: number;
  startDate: string; // ISO
  endDate: string;   // ISO
  status: TimesheetStatus;
  entries: TimesheetEntry[];
}

export interface CreateEntryPayload {
  date: string;
  task: string;
  project: string;
  workType: string;
  hours: number;
  note?: string;
}

export interface UpdateEntryPayload extends Partial<CreateEntryPayload> {}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
