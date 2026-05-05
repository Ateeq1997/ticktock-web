"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import { Timesheet, TimesheetStatus } from "@/types";
import { formatDateRange } from "@/lib/dateUtils";

interface ApiTimesheet extends Timesheet {
  dateRange: string;
  totalHours: number;
}

const PER_PAGE_OPTIONS = [5, 10, 25];

export default function TimesheetTable() {
  const router = useRouter();
  const [timesheets, setTimesheets] = useState<ApiTimesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTimesheets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("perPage", String(perPage));

      const res = await fetch(`/api/timesheets?${params}`);
      if (!res.ok) throw new Error("Failed to fetch timesheets");
      const json = await res.json();
      setTimesheets(json.data);
      setTotalPages(json.totalPages);
      setTotal(json.total);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, perPage]);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, perPage]);

  const handleAction = (ts: ApiTimesheet) => {
    router.push(`/dashboard/${ts.id}`);
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
      <h1 className="text-lg font-semibold text-gray-900 mb-5">Your Timesheets</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
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
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                Array.from({ length: perPage }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-red-500 text-sm">
                    {error} –{" "}
                    <button onClick={fetchTimesheets} className="underline">retry</button>
                  </td>
                </tr>
              )}

              {!loading && !error && timesheets.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">
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
