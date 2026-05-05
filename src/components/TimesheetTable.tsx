"use client";

import { useState, useEffect, useCallback, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import { Timesheet, TimesheetStatus } from "@/types";

interface ApiTimesheet extends Timesheet {
  dateRange: string;
  totalHours: number;
}

interface TimesheetsResponse {
  data: ApiTimesheet[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
  summary: {
    totalHours: number;
    COMPLETED: number;
    INCOMPLETE: number;
    MISSING: number;
  };
}

type SortField = "week" | "date" | "status" | "hours";
type SortOrder = "asc" | "desc";

const PER_PAGE_OPTIONS = [5, 10, 25];
const SORT_OPTIONS: { label: string; value: SortField }[] = [
  { label: "Week number", value: "week" },
  { label: "Date range", value: "date" },
  { label: "Status", value: "status" },
  { label: "Logged hours", value: "hours" },
];

const buildParams = (options: {
  statusFilter: string;
  query: string;
  page: number;
  perPage: number;
  sortBy: SortField;
  sortOrder: SortOrder;
}) => {
  const params = new URLSearchParams();

  if (options.statusFilter) params.set("status", options.statusFilter);
  if (options.query) params.set("query", options.query);
  params.set("page", String(options.page));
  params.set("perPage", String(options.perPage));
  params.set("sortBy", options.sortBy);
  params.set("sortOrder", options.sortOrder);

  return params;
};

const downloadCsv = (rows: ApiTimesheet[]) => {
  const header = ["Week", "Date Range", "Status", "Hours"];
  const lines = rows.map((timesheet) => [
    String(timesheet.weekNumber),
    timesheet.dateRange,
    timesheet.status,
    String(timesheet.totalHours),
  ]);
  const csv = [header, ...lines]
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "timesheets.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function TimesheetTable() {
  const router = useRouter();
  const [timesheets, setTimesheets] = useState<ApiTimesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<SortField>("week");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState<TimesheetsResponse["summary"]>({
    totalHours: 0,
    COMPLETED: 0,
    INCOMPLETE: 0,
    MISSING: 0,
  });
  const deferredSearch = useDeferredValue(search.trim());

  const fetchTimesheets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = buildParams({
        statusFilter,
        query: deferredSearch,
        page,
        perPage,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/timesheets?${params}`);
      if (!res.ok) throw new Error("Failed to fetch timesheets");
      const json: TimesheetsResponse = await res.json();
      setTimesheets(json.data);
      setTotalPages(json.totalPages);
      setTotal(json.total);
      setSummary(json.summary);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, deferredSearch, page, perPage, sortBy, sortOrder]);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, deferredSearch, perPage, sortBy, sortOrder]);

  const handleAction = (ts: ApiTimesheet) => {
    router.push(`/dashboard/${ts.id}`);
  };

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const params = buildParams({
        statusFilter,
        query: deferredSearch,
        page: 1,
        perPage: 1000,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/timesheets?${params}`);
      if (!res.ok) throw new Error("Failed to export timesheets");
      const json: TimesheetsResponse = await res.json();
      downloadCsv(json.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSortBy("week");
    setSortOrder("desc");
    setPerPage(5);
  };

  const getActionLabel = (status: TimesheetStatus) => {
    if (status === "COMPLETED") return "View";
    if (status === "INCOMPLETE") return "Update";
    return "Create";
  };

  const pageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Your Timesheets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Search by week, date range, status, or entry details and export the current view.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={loading || exporting || total === 0}
          className="px-4 py-2 text-sm font-medium text-[#3b5bdb] border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="grid gap-3 mb-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Matching weeks</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Logged hours</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.totalHours}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{summary.COMPLETED}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Needs attention</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {summary.INCOMPLETE + summary.MISSING}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search weeks, projects, tasks..."
          className="form-input min-w-[220px] flex-1 text-sm text-gray-700"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input w-auto text-sm text-gray-600"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="INCOMPLETE">Incomplete</option>
          <option value="MISSING">Missing</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortField)}
          className="form-input w-auto text-sm text-gray-600"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <button
          onClick={() => setSortOrder((current) => (current === "asc" ? "desc" : "asc"))}
          className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>
        <button
          onClick={resetFilters}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            Showing {timesheets.length} of {total} matching timesheets
          </span>
          <span>
            Sorted by {SORT_OPTIONS.find((option) => option.value === sortBy)?.label.toLowerCase()} ({sortOrder})
          </span>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Week #
                  <span className="ml-1 text-gray-300">↕</span>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                  <span className="ml-1 text-gray-300">↕</span>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                  <span className="ml-1 text-gray-300">↕</span>
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                Array.from({ length: perPage }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map((col) => (
                      <td key={col} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-red-500 text-sm">
                    {error} –{" "}
                    <button onClick={fetchTimesheets} className="underline">retry</button>
                  </td>
                </tr>
              )}

              {!loading && !error && timesheets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No timesheets found.
                  </td>
                </tr>
              )}

              {!loading && !error && timesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-700 font-medium">{ts.weekNumber}</td>
                  <td className="px-5 py-4 text-gray-600">{ts.dateRange}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={ts.status} />
                  </td>
                  <td className="px-5 py-4 text-gray-700 font-medium">{ts.totalHours} hrs</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleAction(ts)}
                      className="text-[#3b5bdb] font-medium hover:underline text-sm"
                    >
                      {getActionLabel(ts.status)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="border border-gray-200 rounded-md px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#3b5bdb]"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-[#3b5bdb] text-white"
                      : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
