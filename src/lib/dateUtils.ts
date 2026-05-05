import { format, parseISO, eachDayOfInterval, isWeekend } from "date-fns";

export const formatDateRange = (start: string, end: string): string => {
  const s = parseISO(start);
  const e = parseISO(end);
  const sDay = format(s, "d");
  const eDay = format(e, "d");
  const sMonth = format(s, "MMMM");
  const eMonth = format(e, "MMMM");
  const year = format(s, "yyyy");

  if (sMonth === eMonth) {
    return `${sDay} - ${eDay} ${sMonth}, ${year}`;
  }
  return `${sDay} ${sMonth} - ${eDay} ${eMonth}, ${year}`;
};

export const formatDay = (dateStr: string): string => {
  return format(parseISO(dateStr), "MMM d");
};

export const getWorkdaysForWeek = (start: string, end: string): string[] => {
  const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
  return days
    .filter((d) => !isWeekend(d))
    .map((d) => format(d, "yyyy-MM-dd"));
};

export const formatFullDate = (dateStr: string): string => {
  return format(parseISO(dateStr), "d MMMM yyyy");
};
