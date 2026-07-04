/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length === 0) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const result: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    result.push(row);
  }

  return result;
}

/**
 * Parse a single CSV line handling quoted values
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Validate and normalize nutrition data from parsed file
 */
export interface NormalizedNutritionRow {
  date: string;
  carbsBesar: number;
  proteinBesar: number;
  fatBesar: number;
  fiberBesar: number;
  energyBesar: number;
  carbsKecil: number;
  proteinKecil: number;
  fatKecil: number;
  fiberKecil: number;
  energyKecil: number;
  isValid: boolean;
  error?: string;
}

// Field mappings for various possible column names
const FIELD_MAPPINGS: Record<string, string> = {
  // Tanggal variations
  tanggal: "date",
  date: "date",
  waktu: "date",
  tgl: "date",
  // Karbohidrat variations
  karbohidrat: "carbsBesar",
  "karbohidrat besar": "carbsBesar",
  carbs: "carbsBesar",
  karbo: "carbsBesar",
  // Protein variations
  protein: "proteinBesar",
  "protein besar": "proteinBesar",
  // Lemak variations
  lemak: "fatBesar",
  "lemak besar": "fatBesar",
  fat: "fatBesar",
  // Serat variations
  serat: "fiberBesar",
  "serat besar": "fiberBesar",
  fiber: "fiberBesar",
  // Energi variations
  energi: "energyBesar",
  "energi besar": "energyBesar",
  energy: "energyBesar",
  calories: "energyBesar",
  kcal: "energyBesar",
  // Small portions
  "karbohidrat kecil": "carbsKecil",
  carbskecil: "carbsKecil",
  "protein kecil": "proteinKecil",
  proteinkecil: "proteinKecil",
  "lemak kecil": "fatKecil",
  fatkecil: "fatKecil",
  "serat kecil": "fiberKecil",
  fiberkecil: "fiberKecil",
  "energi kecil": "energyKecil",
  energykecil: "energyKecil",
  calorieskecil: "energyKecil",
  kcalkecil: "energyKecil",
};

function normalizeFieldName(field: string): string {
  const lower = field.toLowerCase().trim();
  return FIELD_MAPPINGS[lower] || field;
}

function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  if (!value || value.toString().trim() === "") return 0;
  // Remove thousand separators and handle both comma and dot as decimal
  const cleaned = value.toString().replace(/[.,' ]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;

  // Unescape forward slashes that might appear in JSON
  const unescaped = dateStr.replace(/\\\//g, "/");

  // Format: MM/DD/YYYY or MM-DD-YYYY or MM.DD.YYYY (US format)
  const mdyMatch = unescaped.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  // Format: YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = unescaped.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  // Try native Date parsing
  const nativeDate = new Date(unescaped);
  if (!isNaN(nativeDate.getTime())) {
    return nativeDate.toISOString().split("T")[0];
  }

  return null;
}

export function normalizeNutritionData(
  data: Record<string, string | number>[],
  _fileType: "json" | "csv"
): NormalizedNutritionRow[] {
  if (data.length === 0) return [];

  // Get keys from first row and normalize them
  const keys = Object.keys(data[0]).map(normalizeFieldName);

  return data.map((row) => {
    // Create normalized row object
    const normalized: Record<string, string | number> = {};
    Object.keys(row).forEach((key, i) => {
      normalized[keys[i]] = row[key];
    });

    // Helper to get value as string
    const getString = (val: string | number | undefined): string => {
      if (val === undefined || val === null) return "";
      return String(val);
    };

    const dateValue = getString(normalized.date || row.date);
    const parsedDate = parseDate(dateValue);

    if (!parsedDate) {
      return {
        date: dateValue,
        carbsBesar: 0,
        proteinBesar: 0,
        fatBesar: 0,
        fiberBesar: 0,
        energyBesar: 0,
        carbsKecil: 0,
        proteinKecil: 0,
        fatKecil: 0,
        fiberKecil: 0,
        energyKecil: 0,
        isValid: false,
        error: `Format tanggal tidak valid: "${dateValue}"`,
      };
    }

    // Helper to get number value
    const getNum = (val: string | number | undefined): number => {
      if (val === undefined || val === null) return 0;
      if (typeof val === "number") return val;
      return parseNumber(val);
    };

    return {
      date: parsedDate,
      carbsBesar: getNum(normalized.carbsBesar || (row as Record<string, string | number>)["Karbohidrat Besar"] || (row as Record<string, string | number>)["Karbo BG"] || (row as Record<string, string | number>)["Karbohidrat"]),
      proteinBesar: getNum(normalized.proteinBesar || (row as Record<string, string | number>)["Protein Besar"] || (row as Record<string, string | number>)["Protein BG"]),
      fatBesar: getNum(normalized.fatBesar || (row as Record<string, string | number>)["Lemak Besar"] || (row as Record<string, string | number>)["Lemak BG"]),
      fiberBesar: getNum(normalized.fiberBesar || (row as Record<string, string | number>)["Serat Besar"] || (row as Record<string, string | number>)["Serat BG"]),
      energyBesar: getNum(normalized.energyBesar || (row as Record<string, string | number>)["Energi Besar"] || (row as Record<string, string | number>)["Energi BG"] || (row as Record<string, string | number>)["Energy"] || (row as Record<string, string | number>)["Kkal BG"]),
      carbsKecil: getNum(normalized.carbsKecil || (row as Record<string, string | number>)["Karbohidrat Kecil"] || (row as Record<string, string | number>)["Karbo KCL"]),
      proteinKecil: getNum(normalized.proteinKecil || (row as Record<string, string | number>)["Protein Kecil"] || (row as Record<string, string | number>)["Protein KCL"]),
      fatKecil: getNum(normalized.fatKecil || (row as Record<string, string | number>)["Lemak Kecil"] || (row as Record<string, string | number>)["Lemak KCL"]),
      fiberKecil: getNum(normalized.fiberKecil || (row as Record<string, string | number>)["Serat Kecil"] || (row as Record<string, string | number>)["Serat KCL"]),
      energyKecil: getNum(normalized.energyKecil || (row as Record<string, string | number>)["Energi Kecil"] || (row as Record<string, string | number>)["Energy KCL"] || (row as Record<string, string | number>)["Kkal KCL"]),
      isValid: true,
    };
  });
}

/**
 * Detect column mappings from headers
 */
export function detectColumnMappings(headers: string[]): Record<string, string> {
  const mappings: Record<string, string> = {};

  headers.forEach(header => {
    const normalized = normalizeFieldName(header);
    if (normalized !== header.toLowerCase().trim()) {
      mappings[header] = normalized;
    }
  });

  return mappings;
}

// Required columns for nutrition data
export const REQUIRED_COLUMNS = [
  { key: "date", aliases: ["tanggal", "date", "waktu", "tgl"] },
  { key: "carbsBesar", aliases: ["karbohidrat", "karbohidrat besar", "carbs", "karbo", "karbo bg", "karbohidrat besar"] },
  { key: "proteinBesar", aliases: ["protein", "protein besar", "protein bg"] },
  { key: "fatBesar", aliases: ["lemak", "lemak besar", "fat", "lemak bg"] },
  { key: "fiberBesar", aliases: ["serat", "serat besar", "fiber", "serat bg"] },
  { key: "energyBesar", aliases: ["energi", "energi besar", "energy", "calories", "kcal", "energi bg", "kkal bg"] },
  { key: "carbsKecil", aliases: ["karbohidrat kecil", "carbskecil", "karbo kecil", "karbo kcl"] },
  { key: "proteinKecil", aliases: ["protein kecil", "proteinkecil", "protein kcl"] },
  { key: "fatKecil", aliases: ["lemak kecil", "fatkecil", "lemak kcl"] },
  { key: "fiberKecil", aliases: ["serat kecil", "fiberkecil", "serat kcl"] },
  { key: "energyKecil", aliases: ["energi kecil", "energykecil", "calorieskecil", "kcalkecil", "energi kcl", "kkal kcl"] },
];

export interface ColumnValidationResult {
  isValid: boolean;
  foundColumns: Record<string, string>; // Maps expected key -> found header name
  missingColumns: string[];
  matchedHeaders: string[];
}

/**
 * Validate that required columns exist in CSV headers
 */
export function validateCSVColumns(headers: string[]): ColumnValidationResult {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const foundColumns: Record<string, string> = {};
  const missingColumns: string[] = [];

  for (const required of REQUIRED_COLUMNS) {
    let found = false;
    for (let i = 0; i < normalizedHeaders.length; i++) {
      const header = normalizedHeaders[i];
      // Check if header matches any alias
      if (required.aliases.some(alias => alias.toLowerCase() === header || header === alias.toLowerCase())) {
        foundColumns[required.key] = headers[i];
        found = true;
        break;
      }
    }
    if (!found) {
      missingColumns.push(required.key);
    }
  }

  return {
    isValid: missingColumns.length === 0,
    foundColumns,
    missingColumns,
    matchedHeaders: Object.values(foundColumns),
  };
}
