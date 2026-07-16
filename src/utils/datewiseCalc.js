import { parseLocalDate } from "./formatDate";

const toInputValue = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const todayInputValue = () => toInputValue(new Date());

/** Add N days to a YYYY-MM-DD value (or today if empty). */
export const addDaysToDateInput = (value, days = 1) => {
  const base = parseLocalDate(value) || new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return toInputValue(next);
};

export const itemLineTotal = (item) => {
  const qty = Number(item?.quantity) || 0;
  const unit = Number(item?.price) || 0;
  return qty * unit;
};

export const calcDayTotals = (day) => {
  const items = day?.items || [];
  const itemsTotal = items.reduce(
    (sum, item) => sum + itemLineTotal(item),
    0
  );
  const delivery = Number(day?.delivery_charge) || 0;
  return {
    itemsTotal,
    deliveryCharge: delivery,
    dayTotal: itemsTotal + delivery,
  };
};

export const calcDatewiseBill = (days = [], discount = 0) => {
  const daySummaries = days.map((day) => ({
    ...calcDayTotals(day),
    localId: day.localId,
    bill_date: day.bill_date,
  }));

  const daysSubtotal = daySummaries.reduce((sum, d) => sum + d.dayTotal, 0);
  const disc = Number(discount) || 0;
  const grandTotal = Math.max(0, daysSubtotal - disc);

  return {
    daySummaries,
    daysSubtotal,
    discount: disc,
    grandTotal,
  };
};
