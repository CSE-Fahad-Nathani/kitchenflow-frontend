import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
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

const toYmd = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/**
 * Month calendar for multi-select dates.
 * selectedDates: string[] YYYY-MM-DD
 * overlapDates: Set|string[] — dates shared with other dishes (highlighted)
 * minDate / maxDate: optional YYYY-MM-DD bounds (days outside are disabled)
 * hint: optional footer hint when nothing selected
 * countLabel: e.g. "excluded" → "3 days excluded"
 */
const DateMultiSelectCalendar = ({
  selectedDates = [],
  onChange,
  overlapDates,
  minDate,
  maxDate,
  hint,
  countLabel = "selected",
}) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const selectedSet = useMemo(
    () => new Set((selectedDates || []).map((d) => String(d).slice(0, 10))),
    [selectedDates]
  );

  const overlapSet = useMemo(() => {
    if (!overlapDates) return new Set();
    if (overlapDates instanceof Set) return overlapDates;
    return new Set([...overlapDates].map((d) => String(d).slice(0, 10)));
  }, [overlapDates]);

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result = [];

    for (let i = 0; i < startPad; i += 1) {
      result.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push(day);
    }
    while (result.length % 7 !== 0) {
      result.push(null);
    }
    return result;
  }, [viewYear, viewMonth]);

  const shiftMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const isOutOfRange = (ymd) => {
    if (minDate && ymd < String(minDate).slice(0, 10)) return true;
    if (maxDate && ymd > String(maxDate).slice(0, 10)) return true;
    return false;
  };

  const toggleDate = (day) => {
    const ymd = toYmd(viewYear, viewMonth, day);
    if (isOutOfRange(ymd)) return;
    const next = new Set(selectedSet);
    if (next.has(ymd)) next.delete(ymd);
    else next.add(ymd);
    onChange?.([...next].sort());
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-2.5">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="press-scale w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-[13px] font-bold text-gray-900">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="press-scale w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day == null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const ymd = toYmd(viewYear, viewMonth, day);
          const selected = selectedSet.has(ymd);
          const overlap = selected && overlapSet.has(ymd);
          const disabled = isOutOfRange(ymd);
          const isToday =
            today.getFullYear() === viewYear &&
            today.getMonth() === viewMonth &&
            today.getDate() === day;

          return (
            <button
              key={ymd}
              type="button"
              disabled={disabled}
              onClick={() => toggleDate(day)}
              className={`press-scale aspect-square rounded-lg text-[12px] font-semibold transition relative ${
                disabled
                  ? "bg-transparent text-gray-300 cursor-not-allowed"
                  : selected
                    ? overlap
                      ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1"
                      : "bg-orange-500 text-white shadow-sm"
                    : isToday
                      ? "bg-white border border-orange-300 text-orange-600"
                      : "bg-white border border-gray-100 text-gray-700 active:bg-orange-50"
              }`}
              title={
                disabled
                  ? `${ymd} · outside bill range`
                  : overlap
                    ? `${ymd} · overlaps another dish`
                    : selected
                      ? ymd
                      : `Select ${ymd}`
              }
            >
              {day}
              {overlap ? (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-200 border border-amber-600" />
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedSet.size > 0 ? (
        <p className="text-[11px] text-gray-500 mt-2 px-0.5">
          {selectedSet.size} day{selectedSet.size === 1 ? "" : "s"} {countLabel}
          {[...selectedSet].some((d) => overlapSet.has(d)) ? (
            <span className="text-amber-700 font-semibold">
              {" "}
              · amber = overlaps another dish
            </span>
          ) : null}
        </p>
      ) : (
        <p className="text-[11px] text-gray-400 mt-2 px-0.5">
          {hint || "Tap dates to select · switch months freely"}
        </p>
      )}
    </div>
  );
};

export default DateMultiSelectCalendar;
