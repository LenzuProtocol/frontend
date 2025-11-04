/**
 * Timezone utilities for the frontend
 *
 * The backend stores and processes all timestamps in UTC, but we want to display
 * them in the user's local timezone for better UX.
 */

/**
 * Get the current UTC timestamp in seconds
 * This is what the backend expects for API calls
 */
export function getCurrentUTCTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get user's timezone name (e.g., "PST", "WIB", "JST")
 */
export function getUserTimezoneName(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat("en", {
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((part) => part.type === "timeZoneName");

    return tzPart?.value || "";
  } catch {
    return "";
  }
}

/**
 * Get user's timezone offset in minutes
 * Positive values are west of UTC, negative values are east
 */
export function getUserTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Get user's timezone offset as a string (e.g., "+07:00", "-05:00")
 */
export function getUserTimezoneOffsetString(): string {
  const offset = getUserTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? "+" : "-";

  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Format a UTC timestamp to user's local time
 * @param timestamp - Unix timestamp in seconds (UTC)
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatTimestampToLocal(
  timestamp: number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(timestamp * 1000);

  return date.toLocaleString(undefined, options);
}

/**
 * Format a UTC timestamp with timezone abbreviation
 * @param timestamp - Unix timestamp in seconds (UTC)
 * @param includeSeconds - Whether to include seconds
 */
export function formatTimestampWithTimezone(
  timestamp: number,
  includeSeconds: boolean = false,
): string {
  const date = new Date(timestamp * 1000);
  const timeZoneName = getUserTimezoneName(date);

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    ...(includeSeconds && { second: "2-digit" }),
    hour12: false,
  });

  const dateStr = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `${dateStr} ${timeStr}${timeZoneName ? ` ${timeZoneName}` : ""}`;
}

/**
 * Get a human-readable description of the user's timezone
 */
export function getTimezoneDescription(): string {
  const name = getUserTimezoneName();
  const offset = getUserTimezoneOffsetString();

  if (name) {
    return `${name} (UTC${offset})`;
  }

  return `UTC${offset}`;
}

/**
 * Convert a local date/time to UTC timestamp
 * @param date - Date object in user's local timezone
 * @returns Unix timestamp in seconds (UTC)
 */
export function localDateToUTCTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Check if two timestamps are on the same day in user's local timezone
 */
export function isSameLocalDay(
  timestamp1: number,
  timestamp2: number,
): boolean {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format a time range in user's local timezone
 */
export function formatTimeRange(from: number, to: number): string {
  const fromDate = new Date(from * 1000);
  const toDate = new Date(to * 1000);
  const isSameDay = isSameLocalDay(from, to);

  const dateFormat: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const timeFormat: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  if (isSameDay) {
    const date = fromDate.toLocaleDateString(undefined, dateFormat);
    const fromTime = fromDate.toLocaleTimeString(undefined, timeFormat);
    const toTime = toDate.toLocaleTimeString(undefined, timeFormat);

    return `${date}, ${fromTime} - ${toTime}`;
  }

  const fromStr = `${fromDate.toLocaleDateString(undefined, dateFormat)} ${fromDate.toLocaleTimeString(undefined, timeFormat)}`;
  const toStr = `${toDate.toLocaleDateString(undefined, dateFormat)} ${toDate.toLocaleTimeString(undefined, timeFormat)}`;

  return `${fromStr} - ${toStr}`;
}
