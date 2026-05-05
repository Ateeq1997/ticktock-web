import { formatDateRange, formatDay, getWorkdaysForWeek } from "../../lib/dateUtils";

describe("formatDateRange", () => {
  it("formats same-month range", () => {
    expect(formatDateRange("2024-01-01", "2024-01-05")).toBe("1 - 5 January, 2024");
  });

  it("formats cross-month range", () => {
    expect(formatDateRange("2024-01-28", "2024-02-01")).toBe("28 January - 1 February, 2024");
  });
});

describe("formatDay", () => {
  it("formats date as Month Day", () => {
    expect(formatDay("2024-01-21")).toBe("Jan 21");
  });
});

describe("getWorkdaysForWeek", () => {
  it("returns 5 workdays for a Mon-Fri week", () => {
    const days = getWorkdaysForWeek("2024-01-01", "2024-01-05");
    expect(days).toHaveLength(5);
  });

  it("excludes weekends", () => {
    const days = getWorkdaysForWeek("2024-01-01", "2024-01-07");
    expect(days).toHaveLength(5);
    expect(days).not.toContain("2024-01-06"); // Saturday
    expect(days).not.toContain("2024-01-07"); // Sunday
  });
});
