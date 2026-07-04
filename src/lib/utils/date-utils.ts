/**
 * Date utility functions - all using UTC consistency
 * This ensures dates are handled consistently across the app
 */

// ============================================================
// UTC-CONSISTENT HELPER FUNCTIONS
// ============================================================

/**
 * Check if a date is a weekend (Saturday or Sunday) using UTC
 * Saturday = 6, Sunday = 0 in getUTCDay()
 */
export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Get the next business day (skip weekends) using UTC
 */
export function getNextBusinessDay(date: Date): Date {
  const next = new Date(date);
  // Ensure we're working with UTC date parts
  while (isWeekend(next)) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}

/**
 * Get today's date at midnight UTC
 */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Get today's date in WIB (UTC+7) timezone
 * Returns a Date object representing midnight in WIB
 */
export function getTodayWIB(): Date {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const wibHours = utcHours + 7;

  // Create date at midnight WIB
  if (wibHours >= 24) {
    // It's before midnight in WIB (past midnight UTC)
    return new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
  }
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
}

/**
 * Add days to a date using UTC
 */
export function addDaysUTC(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Compare two dates by their UTC date part (ignores time)
 */
export function isSameDateUTC(date1: Date, date2: Date): boolean {
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
         date1.getUTCMonth() === date2.getUTCMonth() &&
         date1.getUTCDate() === date2.getUTCDate();
}

/**
 * Check if date1 is before date2 (ignores time, using UTC)
 */
export function isBeforeDateUTC(date1: Date, date2: Date): boolean {
  if (date1.getUTCFullYear() !== date2.getUTCFullYear()) {
    return date1.getUTCFullYear() < date2.getUTCFullYear();
  }
  if (date1.getUTCMonth() !== date2.getUTCMonth()) {
    return date1.getUTCMonth() < date2.getUTCMonth();
  }
  return date1.getUTCDate() < date2.getUTCDate();
}

/**
 * Check if date1 is after date2 (ignores time, using UTC)
 */
export function isAfterDateUTC(date1: Date, date2: Date): boolean {
  if (date1.getUTCFullYear() !== date2.getUTCFullYear()) {
    return date1.getUTCFullYear() > date2.getUTCFullYear();
  }
  if (date1.getUTCMonth() !== date2.getUTCMonth()) {
    return date1.getUTCMonth() > date2.getUTCMonth();
  }
  return date1.getUTCDate() > date2.getUTCDate();
}

/**
 * Format date to YYYY-MM-DD string (UTC)
 */
export function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to Date (UTC midnight)
 */
export function parseDateUTC(dateStr: string): Date {
  return new Date(Date.UTC(
    parseInt(dateStr.substring(0, 4)),
    parseInt(dateStr.substring(5, 7)) - 1,
    parseInt(dateStr.substring(8, 10)),
    0, 0, 0, 0
  ));
}

/**
 * Get dates to sync from startDate to endDate (business days only, UTC)
 */
export function getBusinessDaysRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let current = new Date(startDate);

  while (!isAfterDateUTC(current, endDate)) {
    if (!isWeekend(current)) {
      dates.push(new Date(current));
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

/**
 * Get day name in Indonesian (UTC)
 */
export function getDayNameUTC(date: Date): string {
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return dayNames[date.getUTCDay()];
}

/**
 * Format date for display in Indonesian (e.g., "Senin, 1 Januari 2024")
 */
export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? parseDateUTC(date) : date;
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return `${dayNames[d.getUTCMonth()]}, ${d.getUTCDate()} ${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Get dates that don't exist in the database yet (for syncing)
 * Starts from tomorrow (not today) to only predict future dates
 */
export async function findMissingBusinessDays(
  existingDates: Set<string>,
  fromDate: Date,
  maxDays: number = 30
): Promise<Date[]> {
  const missing: Date[] = [];
  // Start from tomorrow
  let current = addDaysUTC(fromDate, 1);

  for (let i = 0; i < maxDays; i++) {
    const dateStr = formatDateUTC(current);
    if (!isWeekend(current) && !existingDates.has(dateStr)) {
      missing.push(new Date(current));
    }
    current = addDaysUTC(current, 1);
  }

  return missing;
}
