const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * KitchenFlow datetimes are wall-clock strings (no real timezone).
 * Never use `new Date(isoWithZ)` for display — that follows device TZ.
 *
 * Accepts:
 * - "2026-07-17T11:00:00"
 * - "2026-07-17 11:00:00"
 * - "2026-07-17T05:30:00.000Z" (legacy broken JSON — still use digits)
 * - "2026-07-17"
 */
const LOCAL_DATETIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?(?:Z)?$/i;

export const extractLocalDateTimeParts = (value) => {
  if (value == null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
      hour: value.getHours(),
      minute: value.getMinutes(),
      second: value.getSeconds(),
    };
  }

  const m = String(value).trim().match(LOCAL_DATETIME_RE);
  if (!m) return null;

  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4] ?? 0),
    minute: Number(m[5] ?? 0),
    second: Number(m[6] ?? 0),
  };
};

/** Local Date for comparisons / grouping only (from wall-clock parts). */
export const parseLocalDate = (value) => {
  const raw = value != null ? String(value).trim() : "";
  if (/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/i.test(raw)) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const p = extractLocalDateTimeParts(value);
  if (!p) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    return null;
  }
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
};

export const parseLocalDateTime = parseLocalDate;

export const getOrdinalDay = (day) => {
  const n = Number(day);
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

/** Legacy pg DATE JSON ends with Z — use local calendar day, not UTC digits in the string. */
const partsForDisplayDate = (value) => {
  const raw = value != null ? String(value).trim() : "";
  if (/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/i.test(raw)) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
      };
    }
  }
  return extractLocalDateTimeParts(value);
};

/** e.g. 15th July 2026 — from string digits, not device TZ */
export const formatDisplayDate = (value) => {
  const p = partsForDisplayDate(value);
  if (!p) return value ? String(value) : "";
  return `${getOrdinalDay(p.day)} ${MONTHS[p.month - 1]} ${p.year}`;
};

/** e.g. 1 Jan 2026 */
export const formatShortDate = (value) => {
  const p = partsForDisplayDate(value);
  if (!p) return value ? String(value) : "";
  return `${p.day} ${MONTHS[p.month - 1].slice(0, 3)} ${p.year}`;
};

/** e.g. 11:00 am — from string digits, identical on every device */
export const formatDisplayTime = (value) => {
  if (value == null || value === "") return "";

  const raw = String(value).trim();
  // Date-only strings have no time to show
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "";

  const p = extractLocalDateTimeParts(value);
  if (!p) return "";

  const hour24 = p.hour;
  const minute = String(p.minute).padStart(2, "0");
  const ampm = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};

/** Local YYYY-MM-DD (not UTC via toISOString). */
export const toLocalDateInputValue = (base = new Date()) => {
  const d = base instanceof Date ? base : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default formatDisplayDate;
