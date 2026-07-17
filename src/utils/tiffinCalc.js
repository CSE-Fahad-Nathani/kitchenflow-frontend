import { parseLocalDate } from "./formatDate";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Inclusive day count between YYYY-MM-DD dates. */
export const countTotalDays = (fromDate, toDate) => {
  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate);
  if (!from || !to || to < from) return 0;
  return Math.floor((to - from) / MS_PER_DAY) + 1;
};

const toKey = (value) => {
  const d = parseLocalDate(value);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** Unique excluded dates that fall within [fromDate, toDate]. */
export const countExcludedDays = (fromDate, toDate, excludedDates = []) => {
  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate);
  if (!from || !to || to < from) return 0;

  const unique = new Set();

  excludedDates.forEach((entry) => {
    const raw = typeof entry === "string" ? entry : entry?.excluded_date;
    const key = toKey(raw);
    if (!key) return;

    const d = parseLocalDate(key);
    if (!d) return;
    if (d < from || d > to) return;

    unique.add(key);
  });

  return unique.size;
};

export const calcTiffinBill = ({
  fromDate,
  toDate,
  ratePerDay = 0,
  quantity = 1,
  deliveryCharge = 0,
  discount = 0,
  excludedDates = [],
}) => {
  const totalDays = countTotalDays(fromDate, toDate);
  const excludedDays = countExcludedDays(fromDate, toDate, excludedDates);
  const billableDays = Math.max(0, totalDays - excludedDays);
  const rate = Number(ratePerDay) || 0;
  const qty = Math.max(1, Number(quantity) || 1);
  const deliveryPerDay = Number(deliveryCharge) || 0;
  const disc = Number(discount) || 0;
  const itemsSubtotal = billableDays * rate * qty;
  const deliveryTotal = billableDays * deliveryPerDay;
  const grandTotal = Math.max(0, itemsSubtotal + deliveryTotal - disc);

  return {
    totalDays,
    excludedDays,
    billableDays,
    quantity: qty,
    deliveryPerDay,
    subtotal: itemsSubtotal,
    deliveryCharge: deliveryTotal,
    discount: disc,
    grandTotal,
  };
};

export const monthRangeInputValues = (base = new Date()) => {
  const y = base.getFullYear();
  const m = base.getMonth();
  const from = new Date(y, m, 1);
  const to = new Date(y, m + 1, 0);

  const fmt = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return { fromDate: fmt(from), toDate: fmt(to) };
};
