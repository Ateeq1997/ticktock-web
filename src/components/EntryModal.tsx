"use client";

import { useState, useEffect, useRef } from "react";
import { TimesheetEntry, CreateEntryPayload } from "@/types";

const PROJECTS = [
  "Homepage Development",
  "API Integration",
  "Mobile Redesign",
  "QA Testing",
  "Documentation",
  "Backend Services",
];

const WORK_TYPES = [
  "Feature Development",
  "Bug Fixes",
  "Code Review",
  "Testing",
  "Meeting",
  "Design",
  "Documentation",
];

interface EntryModalProps {
  timesheetId: string;
  entry?: TimesheetEntry | null;
  defaultDate?: string;
  workdays: string[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  project?: string;
  workType?: string;
  task?: string;
  date?: string;
  hours?: string;
}

export default function EntryModal({
  timesheetId,
  entry,
  defaultDate,
  workdays,
  onClose,
  onSuccess,
}: EntryModalProps) {
  const isEdit = !!entry;

  const [form, setForm] = useState<CreateEntryPayload>({
    project: entry?.project || "",
    workType: entry?.workType || "Bug Fixes",
    task: entry?.task || "",
    date: entry?.date || defaultDate || workdays[0] || "",
    hours: entry?.hours || 4,
    note: entry?.note || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.project.trim()) e.project = "Project is required";
    if (!form.workType.trim()) e.workType = "Type of work is required";
    if (!form.task.trim()) e.task = "Task description is required";
    if (!form.date) e.date = "Date is required";
    if (!form.hours || form.hours < 0.5 || form.hours > 24)
      e.hours = "Hours must be between 0.5 and 24";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");

    const url = isEdit
      ? `/api/timesheets/${timesheetId}/entries/${entry!.id}`
      : `/api/timesheets/${timesheetId}/entries`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        else setApiError(json.error || "An error occurred");
        return;
      }

      onSuccess();
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof CreateEntryPayload, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val }));

  const formatDateLabel = (dateStr: string) => {
    try {
      return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric",
      });
    } catch { return dateStr; }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Edit Entry" : "Add New Entry"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">
              {apiError}
            </div>
          )}

          {/* Project */}
          <div>
            <label className="form-label">
              Select Project <span className="text-red-500">*</span>
              <span className="ml-1 text-gray-300 text-xs cursor-help" title="Choose the project this work belongs to">ⓘ</span>
            </label>
            <select
              value={form.project}
              onChange={(e) => set("project", e.target.value)}
              className="form-input"
            >
              <option value="">Project Name</option>
              {PROJECTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.project && <p className="form-error">{errors.project}</p>}
          </div>

          {/* Type of Work */}
          <div>
            <label className="form-label">
              Type of Work <span className="text-red-500">*</span>
              <span className="ml-1 text-gray-300 text-xs cursor-help" title="Select the category of work">ⓘ</span>
            </label>
            <select
              value={form.workType}
              onChange={(e) => set("workType", e.target.value)}
              className="form-input"
            >
              {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.workType && <p className="form-error">{errors.workType}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="form-label">
              Date <span className="text-red-500">*</span>
            </label>
            <select
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="form-input"
            >
              {workdays.map((d) => (
                <option key={d} value={d}>{formatDateLabel(d)}</option>
              ))}
            </select>
            {errors.date && <p className="form-error">{errors.date}</p>}
          </div>

          {/* Task description */}
          <div>
            <label className="form-label">
              Task description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Write text here ..."
              value={form.task}
              onChange={(e) => set("task", e.target.value)}
              className="form-input resize-none"
            />
            {errors.task && <p className="form-error">{errors.task}</p>}
          </div>

          {/* Note */}
          <p className="text-xs text-gray-400 -mt-2">A note for extra info.</p>

          {/* Hours */}
          <div>
            <label className="form-label">
              Hours <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => set("hours", Math.max(0.5, form.hours - 0.5))}
                className="w-9 h-9 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700 hover:bg-gray-100 text-lg flex items-center justify-center transition-colors"
              >
                −
              </button>
              <input
                type="number"
                min={0.5}
                max={24}
                step={0.5}
                value={form.hours}
                onChange={(e) => set("hours", parseFloat(e.target.value) || 0.5)}
                className="w-14 h-9 border-y border-gray-300 text-center text-sm focus:outline-none focus:ring-1 focus:ring-[#3b5bdb]"
              />
              <button
                type="button"
                onClick={() => set("hours", Math.min(24, form.hours + 0.5))}
                className="w-9 h-9 border border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 text-lg flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
            {errors.hours && <p className="form-error">{errors.hours}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-6 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Saving..." : isEdit ? "Save changes" : "Add entry"}
          </button>
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
