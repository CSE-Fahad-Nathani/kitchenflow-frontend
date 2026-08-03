/**
 * Calendar Bill calc
 * Per dish day: (rate × qty) + delivery
 * Per dish total: dayAmount × selectedDays
 * Grand total: sum of dish totals
 */

import { formatShortDate } from "./formatDate";

export const calcDishDayAmount = (dish) => {
  const rate = Number(dish?.rate_per_day) || 0;
  const qty = Number(dish?.quantity) || 1;
  const delivery = Number(dish?.delivery_charge_per_day) || 0;
  return rate * qty + delivery;
};

export const normalizeDates = (dates = []) =>
  [
    ...new Set(
      (dates || [])
        .map((d) => String(d).slice(0, 10))
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    ),
  ].sort();

export const calcDishTotals = (dish) => {
  const dates = normalizeDates(dish?.dates);
  const dayAmount = calcDishDayAmount(dish);
  const dayCount = dates.length;
  return {
    dates,
    dayCount,
    dayAmount,
    dishTotal: dayAmount * dayCount,
  };
};

/** Dates selected by 2+ dishes on this bill. */
export const findOverlappingDates = (dishes = []) => {
  const counts = new Map();

  for (const dish of dishes) {
    for (const date of normalizeDates(dish?.dates)) {
      counts.set(date, (counts.get(date) || 0) + 1);
    }
  }

  return new Set(
    [...counts.entries()].filter(([, count]) => count > 1).map(([date]) => date)
  );
};

/** Group YYYY-MM-DD dates into [{ key, label, days }] for bill display. */
export const groupDatesByMonth = (dates = []) => {
  const sorted = normalizeDates(dates);
  const MONTHS_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const groups = [];
  let current = null;

  for (const ymd of sorted) {
    const [y, m, d] = ymd.split("-").map(Number);
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (!current || current.key !== key) {
      current = {
        key,
        label: `${MONTHS_SHORT[m - 1]} ${y}`,
        days: [],
      };
      groups.push(current);
    }
    current.days.push(d);
  }

  return groups;
};

/** Earliest and latest selected dates across all dishes. */
export const getBillDateRange = (dishes = []) => {
  const all = normalizeDates(
    dishes.flatMap((dish) => dish?.dates || [])
  );
  if (all.length === 0) return { fromDate: null, toDate: null };
  return { fromDate: all[0], toDate: all[all.length - 1] };
};

export const calcCalendarBill = (dishes = []) => {
  const dishSummaries = dishes.map((dish) => ({
    localId: dish.localId,
    dish_entry_id: dish.dish_entry_id,
    dish_name: dish.dish_name,
    ...calcDishTotals(dish),
  }));

  const grandTotal = dishSummaries.reduce((sum, d) => sum + d.dishTotal, 0);
  const totalDays = dishSummaries.reduce((sum, d) => sum + d.dayCount, 0);
  const overlappingDates = findOverlappingDates(dishes);
  const { fromDate, toDate } = getBillDateRange(dishes);

  return {
    dishSummaries,
    grandTotal,
    totalDays,
    dishCount: dishes.length,
    overlappingDates,
    fromDate,
    toDate,
  };
};

export const buildCalendarBillText = (bill, calc) => {
  const customerName = bill.customer_name?.trim();
  const customerMobile = bill.customer_mobile?.trim();

  let customerLine = "";
  if (customerName && customerMobile) {
    customerLine = `${customerName} (${customerMobile})\n`;
  } else if (customerName) {
    customerLine = `${customerName}\n`;
  } else if (customerMobile) {
    customerLine = `${customerMobile}\n`;
  }

  const period =
    calc.fromDate && calc.toDate
      ? `${formatShortDate(calc.fromDate)} - ${formatShortDate(calc.toDate)}`
      : "";

  const dishBlocks = (bill.dishes || [])
    .map((dish, index) => {
      const summary = calc.dishSummaries[index] || calcDishTotals(dish);
      const delivery = Number(dish.delivery_charge_per_day) || 0;
      const lines = [
        `${dish.dish_name || "Dish"} = *₹${Number(summary.dishTotal).toLocaleString("en-IN")}*`,
        `  ${Number(dish.quantity) || 1}×₹${Number(dish.rate_per_day || 0).toLocaleString("en-IN")}/day · ${summary.dayCount}d${
          delivery > 0
            ? ` · +₹${delivery.toLocaleString("en-IN")} del`
            : ""
        }`,
      ];

      if (bill.show_dates && summary.dates.length) {
        const monthGroups = groupDatesByMonth(summary.dates);
        for (const group of monthGroups) {
          lines.push(`  ${group.label}: ${group.days.join(", ")}`);
        }
      }

      return lines.join("\n");
    })
    .join("\n");

  return `*Arefa's Kitchen*

${customerLine}${period}

${dishBlocks}

*Total = ₹${Number(bill.total_amount ?? calc.grandTotal).toLocaleString("en-IN")}*`;
};
