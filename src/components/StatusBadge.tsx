import { TimesheetStatus } from "@/types";
import clsx from "clsx";

interface StatusBadgeProps {
  status: TimesheetStatus;
}

const config: Record<TimesheetStatus, { label: string; className: string }> = {
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
  INCOMPLETE: { label: "Incomplete", className: "bg-yellow-100 text-yellow-700" },
  MISSING: { label: "Missing", className: "bg-red-100 text-red-600" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status] ?? config.MISSING;
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase",
        className
      )}
    >
      {label}
    </span>
  );
}
