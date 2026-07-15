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

/** Parse date / datetime without UTC day-shift for YYYY-MM-DD. */
export const parseLocalDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

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

/** e.g. 15th July 2026 */
export const formatDisplayDate = (value) => {
  const d = parseLocalDate(value);
  if (!d) return value ? String(value) : "";
  return `${getOrdinalDay(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export default formatDisplayDate;
