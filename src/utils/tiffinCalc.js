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

/** Prefer dishes[]; fall back to legacy single-dish fields on the bill. */
export const normalizeTiffinDishes = (billOrDishes) => {
  if (Array.isArray(billOrDishes)) {
    return billOrDishes.filter((d) => d?.dish_name || d?.rate_per_day != null);
  }

  const bill = billOrDishes || {};
  if (Array.isArray(bill.dishes) && bill.dishes.length > 0) {
    return bill.dishes;
  }

  if (bill.dish_name || bill.rate_per_day != null) {
    return [
      {
        dish_name: bill.dish_name || "",
        variant_name: bill.variant_name || "",
        rate_per_day: bill.rate_per_day,
        quantity: bill.quantity ?? 1,
        delivery_charge_per_day:
          bill.delivery_charge_per_day ?? bill.delivery_charge ?? 0,
      },
    ];
  }

  return [];
};

export const calcTiffinBill = ({
  fromDate,
  toDate,
  dishes,
  ratePerDay = 0,
  quantity = 1,
  deliveryCharge = 0,
  discount = 0,
  excludedDates = [],
}) => {
  const totalDays = countTotalDays(fromDate, toDate);
  const excludedDays = countExcludedDays(fromDate, toDate, excludedDates);
  const billableDays = Math.max(0, totalDays - excludedDays);
  const disc = Number(discount) || 0;

  const dishList =
    Array.isArray(dishes) && dishes.length > 0
      ? dishes
      : [
          {
            rate_per_day: ratePerDay,
            quantity,
            delivery_charge_per_day: deliveryCharge,
          },
        ];

  let itemsSubtotal = 0;
  let deliveryTotal = 0;
  let deliveryPerDaySum = 0;

  const dishBreakdown = dishList.map((dish) => {
    const rate = Number(dish.rate_per_day) || 0;
    const qty = Math.max(1, Number(dish.quantity) || 1);
    const deliveryPerDay =
      Number(dish.delivery_charge_per_day ?? dish.delivery_charge) || 0;
    const subtotal = billableDays * rate * qty;
    const dishDelivery = billableDays * deliveryPerDay;
    itemsSubtotal += subtotal;
    deliveryTotal += dishDelivery;
    deliveryPerDaySum += deliveryPerDay;
    return {
      dish_name: dish.dish_name || "",
      variant_name: dish.variant_name || "",
      rate_per_day: rate,
      quantity: qty,
      deliveryPerDay,
      subtotal,
      deliveryTotal: dishDelivery,
    };
  });

  const grandTotal = Math.max(0, itemsSubtotal + deliveryTotal - disc);

  return {
    totalDays,
    excludedDays,
    billableDays,
    dishes: dishBreakdown,
    quantity: dishBreakdown[0]?.quantity ?? 1,
    deliveryPerDay: deliveryPerDaySum,
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

const MONTH_NAMES = [
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
 * Group excluded dates for compact bill lines:
 * [{ key, label: "August", daysText: "1, 2, 5, 8, 9" }]
 * Includes year in label when dates span multiple years.
 */
export const groupExcludedByMonth = (excludedDates = []) => {
  const ymds = [
    ...new Set(
      (excludedDates || [])
        .map((entry) => {
          const raw =
            typeof entry === "string" ? entry : entry?.excluded_date;
          return raw ? String(raw).slice(0, 10) : "";
        })
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    ),
  ].sort();

  if (ymds.length === 0) return [];

  const years = new Set(ymds.map((d) => d.slice(0, 4)));
  const includeYear = years.size > 1;

  const groups = [];
  let current = null;

  for (const ymd of ymds) {
    const [y, m, d] = ymd.split("-").map(Number);
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (!current || current.key !== key) {
      current = {
        key,
        label: includeYear
          ? `${MONTH_NAMES[m - 1]} ${y}`
          : MONTH_NAMES[m - 1],
        days: [],
      };
      groups.push(current);
    }
    current.days.push(d);
  }

  return groups.map((g) => ({
    key: g.key,
    label: g.label,
    daysText: g.days.join(", "),
  }));
};
