/**
 * Parse tanggal dari format Indonesia "M/D/YYYY" atau "MM/DD/YYYY"
 * menjadi Date object standar
 *
 * @param dateStr - String tanggal contoh "12/1/2025" atau "1/12/2026"
 * @returns Date object
 */
export function parseIndonesianDate(dateStr: string): Date {
  const parts = dateStr.split("/");
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}. Expected M/D/YYYY or MM/DD/YYYY`);
  }

  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Validate
  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    throw new Error(`Invalid date components: ${dateStr}`);
  }

  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }

  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}`);
  }

  // Create date with padding for single digit month/day
  const paddedMonth = month.toString().padStart(2, "0");
  const paddedDay = day.toString().padStart(2, "0");

  return new Date(`${year}-${paddedMonth}-${paddedDay}`);
}

/**
 * Format Date object ke string Indonesia "YYYY-MM-DD"
 * untuk keperluan display atau database
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format Date object ke string Indonesia "D/M/YYYY"
 * untuk display di UI
 */
export function formatDateToIndonesian(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Format Date untuk display manusiawi
 * contoh: "12 Desember 2025"
 */
export function formatDateHuman(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}
