import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchMonthlyStatistics } from "../../api/dashboardApi";
import { formatDisplayDate, formatShortDate } from "../../utils/formatDate";
import { useToastStore } from "../../store/toastStore";
import { AnalysisSectionSkeleton } from "../../components/Skeleton";

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

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const moneyExact = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const num = (n) => Number(n || 0).toLocaleString("en-IN");

const Section = ({ title, children, className = "" }) => (
  <section
    className={`bg-white rounded-2xl border border-gray-100 p-3 shadow-[0_1px_8px_rgba(0,0,0,0.03)] ${className}`}
  >
    <h2 className="text-[13px] font-bold text-gray-800 tracking-wide mb-2.5">
      {title}
    </h2>
    {children}
  </section>
);

const StatTile = ({ label, value, sub }) => (
  <div className="rounded-xl bg-gray-50 border border-gray-100 px-2.5 py-2 min-w-0">
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">
      {label}
    </p>
    <p className="text-[15px] font-bold text-gray-900 mt-0.5 truncate">
      {value}
    </p>
    {sub ? (
      <p className="text-[10.5px] text-gray-500 mt-0.5 truncate">{sub}</p>
    ) : null}
  </div>
);

const RevenueSourceRow = ({ label, amount, count, countLabel, total }) => {
  const value = Number(amount) || 0;
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900 shrink-0">{moneyExact(value)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-orange-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10.5px] text-gray-400">
        {num(count)} {countLabel}
        {total > 0 ? ` · ${pct.toFixed(0)}%` : ""}
      </p>
    </div>
  );
};

const GrowthPill = ({ label, value }) => {
  const n = Number(value) || 0;
  const up = n >= 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <span className="text-[12px] font-medium text-gray-600">{label}</span>
      <span
        className={`inline-flex items-center gap-1 text-[13px] font-bold ${
          up ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        <Icon size={14} />
        {up ? "+" : ""}
        {n}%
      </span>
    </div>
  );
};

const RankRow = ({ rank, title, meta, value }) => (
  <div className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
    <span className="w-5 h-5 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold flex items-center justify-center shrink-0">
      {rank}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[13px] font-semibold text-gray-900 truncate">{title}</p>
      {meta ? (
        <p className="text-[11px] text-gray-500 truncate">{meta}</p>
      ) : null}
    </div>
    <p className="text-[13px] font-bold text-orange-500 shrink-0">{value}</p>
  </div>
);

const PREVIEW_COUNT = 3;

/** Shows first 3 items, with Show more / Show less when longer. */
const ExpandableList = ({ items = [], emptyText = "No data", renderItem }) => {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > PREVIEW_COUNT;
  const visible = expanded || !hasMore ? items : items.slice(0, PREVIEW_COUNT);

  if (items.length === 0) {
    return (
      <p className="text-[12px] text-gray-400 text-center py-2">{emptyText}</p>
    );
  }

  return (
    <div>
      {visible.map((item, index) => renderItem(item, index))}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="press-scale mt-1.5 w-full h-9 rounded-xl text-[12px] font-semibold text-orange-700 bg-orange-50 border border-orange-100 active:bg-orange-100"
        >
          {expanded
            ? "Show less"
            : `Show more (${items.length - PREVIEW_COUNT} more)`}
        </button>
      )}
    </div>
  );
};

const Analysis = () => {
  const navigate = useNavigate();
  const toast = useToastStore();
  const now = useMemo(() => new Date(), []);

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const shiftMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const result = await fetchMonthlyStatistics(month, year);
        setData(result);
      } catch (error) {
        console.error(error);
        setData(null);
        toast.error(
          "Failed",
          error?.response?.data?.message || "Unable to load analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const revenue = data?.revenue || {};
  const customers = data?.customers || {};
  const growth = data?.growth || {};
  const bestDay = data?.best_day;
  const tiffin = data?.monthly_tiffin || {};
  const datewise = data?.datewise_bills || {};
  const sunday = data?.sunday_revenue || {};
  const sundayDays = sunday.days || [];
  const bestSunday = sunday.best_sunday;
  const daily = data?.daily_revenue || [];
  const weekly = data?.weekly_revenue || [];
  const topCustomers = data?.top_customers || [];
  const topDishes = data?.top_dishes || [];
  const highestBills = data?.highest_bills || [];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-3.5 pt-safe pb-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 mb-2.5">
          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Back"
            className="press-scale w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[1.15rem] font-bold text-gray-900 tracking-tight">
              Analysis
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Monthly business overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-orange-50 border border-orange-100 p-1.5">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="press-scale w-10 h-10 rounded-xl bg-white border border-orange-100 text-orange-600 flex items-center justify-center shrink-0"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 min-w-0 text-center">
            <p className="text-[15px] font-bold text-gray-900 truncate">
              {MONTHS[month - 1]} {year}
            </p>
            <div className="mt-1 flex justify-center gap-1.5">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="h-7 rounded-lg border border-orange-100 bg-white px-1.5 text-[11px] font-semibold text-gray-700 outline-none"
              >
                {MONTHS.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-7 rounded-lg border border-orange-100 bg-white px-1.5 text-[11px] font-semibold text-gray-700 outline-none"
              >
                {Array.from({ length: 7 }, (_, i) => now.getFullYear() - 3 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="press-scale w-10 h-10 rounded-xl bg-white border border-orange-100 text-orange-600 flex items-center justify-center shrink-0"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="px-3.5 py-3 space-y-2.5">
        {loading ? (
          <div className="space-y-2.5" aria-busy="true" aria-label="Loading analysis">
            <AnalysisSectionSkeleton tiles={6} />
            <AnalysisSectionSkeleton tiles={3} />
            <AnalysisSectionSkeleton tiles={0} rows={3} />
            <AnalysisSectionSkeleton tiles={2} />
            <AnalysisSectionSkeleton tiles={3} />
            <AnalysisSectionSkeleton tiles={3} />
            <AnalysisSectionSkeleton tiles={3} rows={3} />
            <AnalysisSectionSkeleton tiles={0} rows={3} />
            <AnalysisSectionSkeleton tiles={0} rows={3} />
          </div>
        ) : !data ? (
          <div className="py-16 text-center text-[13px] text-gray-500">
            No data for this month
          </div>
        ) : (
          <>
            <Section title="Revenue Overview">
              <div className="rounded-xl bg-orange-50 border border-orange-100 px-3 py-2.5 mb-2.5">
                <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider">
                  Total Revenue
                </p>
                <p className="text-[20px] font-bold text-gray-900 mt-0.5">
                  {moneyExact(revenue.total_revenue)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 mb-2.5 space-y-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  By bill type
                </p>
                <RevenueSourceRow
                  label="Standard Bills"
                  amount={revenue.by_type?.standard_orders?.revenue}
                  count={revenue.by_type?.standard_orders?.count}
                  countLabel="orders"
                  total={Number(revenue.total_revenue)}
                />
                <RevenueSourceRow
                  label="Monthly Tiffin"
                  amount={revenue.by_type?.monthly_tiffin?.revenue}
                  count={revenue.by_type?.monthly_tiffin?.count}
                  countLabel="bills"
                  total={Number(revenue.total_revenue)}
                />
                <RevenueSourceRow
                  label="Date-wise Bills"
                  amount={revenue.by_type?.datewise_bills?.revenue}
                  count={revenue.by_type?.datewise_bills?.count}
                  countLabel="bills"
                  total={Number(revenue.total_revenue)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <StatTile label="Total Orders" value={num(revenue.total_orders)} />
                <StatTile label="Average Bill" value={money(revenue.average_bill)} />
                <StatTile label="Highest Bill" value={money(revenue.highest_bill)} />
                <StatTile label="Delivery" value={money(revenue.total_delivery)} />
                <StatTile label="Discount" value={money(revenue.total_discount)} />
              </div>
            </Section>

            <Section title="Customers">
              <div className="grid grid-cols-3 gap-2">
                <StatTile label="Total" value={num(customers.total_customers)} />
                <StatTile label="New" value={num(customers.new_customers)} />
                <StatTile label="Active" value={num(customers.active_customers)} />
              </div>
            </Section>

            <Section title="Growth vs Last Month">
              <div className="space-y-1.5">
                <GrowthPill label="Revenue" value={growth.revenue_growth} />
                <GrowthPill label="Orders" value={growth.order_growth} />
                <GrowthPill label="Avg Bill" value={growth.average_bill_growth} />
              </div>
            </Section>

            <Section title="Best Day">
              {bestDay?.date ? (
                <div className="rounded-xl bg-orange-50 border border-orange-100 px-3 py-2.5">
                  <p className="text-[14px] font-bold text-gray-900">
                    {formatDisplayDate(bestDay.date)}
                  </p>
                  <div className="mt-1.5 flex justify-between text-[12.5px]">
                    <span className="text-gray-500">
                      {num(bestDay.total_orders)} orders
                    </span>
                    <span className="font-bold text-orange-600">
                      {money(bestDay.total_revenue)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-gray-400 text-center py-2">
                  No best day data
                </p>
              )}
            </Section>

            <Section title="Monthly Tiffin">
              <div className="grid grid-cols-3 gap-2">
                <StatTile label="Bills" value={num(tiffin.total_bills)} />
                <StatTile label="Revenue" value={money(tiffin.total_revenue)} />
                <StatTile label="Avg Bill" value={money(tiffin.average_bill)} />
              </div>
            </Section>

            <Section title="Date-wise Bills">
              <div className="grid grid-cols-3 gap-2">
                <StatTile label="Bills" value={num(datewise.total_bills)} />
                <StatTile label="Revenue" value={money(datewise.total_revenue)} />
                <StatTile label="Avg Bill" value={money(datewise.average_bill)} />
              </div>
            </Section>

            <Section title="Sunday Revenue">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <StatTile label="Sundays" value={num(sunday.total_sundays)} />
                <StatTile label="Revenue" value={money(sunday.total_revenue)} />
                <StatTile label="Avg" value={money(sunday.average_revenue)} />
              </div>

              {bestSunday?.date ? (
                <div className="rounded-xl bg-orange-50 border border-orange-100 px-3 py-2 mb-2">
                  <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide">
                    Best Sunday
                  </p>
                  <p className="text-[13px] font-bold text-gray-900 mt-0.5">
                    {formatDisplayDate(bestSunday.date)}
                  </p>
                  <div className="mt-1 flex justify-between text-[12px]">
                    <span className="text-gray-500">
                      {num(bestSunday.total_orders)} orders
                    </span>
                    <span className="font-bold text-orange-600">
                      {money(bestSunday.revenue)}
                    </span>
                  </div>
                </div>
              ) : null}

              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1 px-0.5">
                Sunday days
              </p>
              <ExpandableList
                items={sundayDays}
                emptyText="No Sunday revenue this month"
                renderItem={(row, i) => (
                  <div
                    key={row.date || i}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">
                        {formatShortDate(row.date)}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {num(row.total_orders)} orders
                      </p>
                    </div>
                    <p className="text-[13px] font-bold text-orange-500">
                      {moneyExact(row.revenue)}
                    </p>
                  </div>
                )}
              />
            </Section>

            <Section title="Daily Revenue">
              <ExpandableList
                items={daily}
                emptyText="No daily data"
                renderItem={(row) => (
                  <div
                    key={row.date}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">
                        {formatShortDate(row.date)}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {num(row.total_orders)} orders
                      </p>
                    </div>
                    <p className="text-[13px] font-bold text-orange-500">
                      {moneyExact(row.total_revenue)}
                    </p>
                  </div>
                )}
              />
            </Section>

            <Section title="Weekly Revenue">
              <ExpandableList
                items={weekly}
                emptyText="No weekly data"
                renderItem={(row) => (
                  <div
                    key={row.week}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">
                        Week {row.week}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {num(row.total_orders)} orders
                      </p>
                    </div>
                    <p className="text-[13px] font-bold text-orange-500">
                      {moneyExact(row.total_revenue)}
                    </p>
                  </div>
                )}
              />
            </Section>

            <Section title="Top Customers">
              <ExpandableList
                items={topCustomers}
                emptyText="No customers yet"
                renderItem={(c, i) => (
                  <RankRow
                    key={`${c.customer_name}-${c.customer_mobile}-${i}`}
                    rank={i + 1}
                    title={c.customer_name || "Customer"}
                    meta={[
                      c.customer_mobile || null,
                      `${num(c.total_orders)} orders`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    value={money(c.total_spent)}
                  />
                )}
              />
            </Section>

            <Section title="Top Dishes">
              <ExpandableList
                items={topDishes}
                emptyText="No dishes yet"
                renderItem={(d, i) => (
                  <RankRow
                    key={`${d.dish_name}-${i}`}
                    rank={i + 1}
                    title={(d.dish_name || "Dish").trim()}
                    meta={`${num(d.times_ordered)}× · qty ${num(d.total_quantity)}`}
                    value={money(d.total_revenue)}
                  />
                )}
              />
            </Section>

            <Section title="Highest Bills">
              <ExpandableList
                items={highestBills}
                emptyText="No bills yet"
                renderItem={(b, i) => (
                  <RankRow
                    key={b.order_id || i}
                    rank={i + 1}
                    title={b.customer_name || "Customer"}
                    meta={[
                      b.customer_mobile || null,
                      b.delivery_datetime
                        ? formatShortDate(b.delivery_datetime)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    value={money(b.total_amount)}
                  />
                )}
              />
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

export default Analysis;
