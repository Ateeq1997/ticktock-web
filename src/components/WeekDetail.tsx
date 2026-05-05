"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Timesheet, TimesheetEntry } from "@/types";
import { formatDateRange, formatDay, getWorkdaysForWeek } from "@/lib/dateUtils";
import EntryModal from "./EntryModal";
import StatusBadge from "./StatusBadge";

interface ApiTimesheet extends Timesheet {
  dateRange: string;
  totalHours: number;
}

interface WeekDetailProps {
  weekId: string;
}

export default function WeekDetail({ weekId }: WeekDetailProps) {
  const router = useRouter();
  const [timesheet, setTimesheet] = useState<ApiTimesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<TimesheetEntry | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");
  const [ctxMenu, setCtxMenu] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const ctxRef = useRef<HTMLDivElement | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/timesheets/${weekId}`);
      if (!res.ok) throw new Error("Timesheet not found");
      const json = await res.json();
      setTimesheet(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [weekId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) {
        setCtxMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = async (entryId: string) => {
    if (!confirm("Delete this entry?")) return;
    setDeletingId(entryId);
    setCtxMenu(null);
    try {
      const res = await fetch(`/api/timesheets/${weekId}/entries/${entryId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetch_();
    } catch {
      alert("Could not delete entry. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const openAdd = (date?: string) => {
    setEditEntry(null);
    setDefaultDate(date || "");
    setShowModal(true);
  };

  const openEdit = (entry: TimesheetEntry) => {
    setEditEntry(entry);
    setDefaultDate(entry.date);
    setCtxMenu(null);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditEntry(null);
    fetch_();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !timesheet) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="mb-3">{error || "Timesheet not found."}</p>
        <Link href="/dashboard" className="text-[#3b5bdb] hover:underline text-sm">
          ← Back to timesheets
        </Link>
      </div>
    );
  }

  const workdays = getWorkdaysForWeek(timesheet.startDate, timesheet.endDate);
  const totalHours = timesheet.entries.reduce((s, e) => s + e.hours, 0);
  const pct = Math.min(100, Math.round((totalHours / 40) * 100));

  // Group entries by date
  const byDay: Record<string, TimesheetEntry[]> = {};
  for (const entry of timesheet.entries) {
    if (!byDay[entry.date]) byDay[entry.date] = [];
    byDay[entry.date].push(entry);
  }

  // All workdays (including empty ones)
  const allDays = workdays;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link href="/dashboard" className="hover:text-[#3b5bdb] transition-colors">
          Timesheets
        </Link>
        <span className="text-gray-300">›</span>
        <span className="text-gray-700">Week {timesheet.weekNumber}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <h1 className="text-lg font-semibold text-gray-900">This week&apos;s timesheet</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">{totalHours}/40 hrs</span>
          <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3b5bdb] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{pct}%</span>
          <StatusBadge status={timesheet.status} />
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-5">{timesheet.dateRange}</p>

      {/* Day sections */}
      <div className="space-y-4">
        {allDays.map((day) => {
          const entries = byDay[day] || [];
          const dayLabel = formatDay(day);

          return (
            <div key={day}>
              <p className="text-sm font-semibold text-gray-800 mb-1.5">{dayLabel}</p>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {entries.length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-400 italic">No entries</p>
                )}

                {entries.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      idx < entries.length - 1 ? "border-b border-gray-100" : ""
                    } ${deletingId === entry.id ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    <span className="flex-1 text-sm text-gray-700 font-medium">{entry.task}</span>
                    <span className="text-xs text-gray-400">{entry.hours} hrs</span>
                    <span className="bg-blue-50 text-[#3b5bdb] text-xs px-2 py-0.5 rounded font-medium">
                      {entry.project}
                    </span>

                    {/* Context menu */}
                    <div className="relative" ref={ctxMenu === entry.id ? ctxRef : null}>
                      <button
                        onClick={() => setCtxMenu(ctxMenu === entry.id ? null : entry.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors px-1 py-0.5 rounded hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      </button>

                      {ctxMenu === entry.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                          <button
                            onClick={() => openEdit(entry)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add new task row */}
                <button
                  onClick={() => openAdd(day)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#3b5bdb] hover:bg-indigo-50 transition-colors border-t border-dashed border-indigo-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add new task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Add Entry button */}
      <div className="mt-6">
        <button onClick={() => openAdd()} className="btn-primary">
          + Add entry
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <EntryModal
          timesheetId={weekId}
          entry={editEntry}
          defaultDate={defaultDate}
          workdays={workdays}
          onClose={() => { setShowModal(false); setEditEntry(null); }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
