import { useRef, useState } from "react";
import {
  X,
  Download,
  Image as ImageIcon,
  FileText,
  Copy,
  Loader2,
  ChevronUp,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useToastStore } from "../../store/toastStore";
import { formatShortDate } from "../../utils/formatDate";
import {
  buildCalendarBillText,
  calcCalendarBill,
  calcDishTotals,
  groupDatesByMonth,
} from "../../utils/calendarBillCalc";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const MONTH_FULL = [
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

/** Compact month lines: "August: 1, 2, 5" (year only if spanning years). */
const formatDateGroups = (dates = []) => {
  const groups = groupDatesByMonth(dates);
  if (groups.length === 0) return [];
  const years = new Set(groups.map((g) => g.key.slice(0, 4)));
  const includeYear = years.size > 1;

  return groups.map((g) => {
    const [y, m] = g.key.split("-").map(Number);
    const label = includeYear
      ? `${MONTH_FULL[m - 1]} ${y}`
      : MONTH_FULL[m - 1];
    return { key: g.key, text: `${label}: ${g.days.join(", ")}` };
  });
};

/** hex-only styles — html2canvas cannot parse Tailwind v4 oklch() colors */
const s = {
  bill: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: "340px",
    margin: "0 auto",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    color: "#111827",
    boxSizing: "border-box",
  },
  inner: {
    padding: "18px 16px 16px",
    boxSizing: "border-box",
  },
  center: { textAlign: "center" },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: "11px",
    color: "#6b7280",
  },
  badge: {
    margin: "6px 0 0",
    fontSize: "10px",
    fontWeight: 600,
    color: "#f97316",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  reminderBanner: {
    margin: "0 0 8px",
    padding: "5px 8px",
    backgroundColor: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "6px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: 800,
    color: "#ea580c",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  divider: {
    borderTop: "1px dashed #d1d5db",
    margin: "10px 0",
  },
  hairline: {
    borderTop: "1px solid #f3f4f6",
    margin: "3px 0",
  },
  dividerSolid: {
    borderTop: "1px solid #e5e7eb",
    margin: "8px 0 0",
    paddingTop: "10px",
  },
  meta: { fontSize: "12px", color: "#374151" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "3px",
  },
  label: { color: "#6b7280" },
  value: { fontWeight: 600, color: "#111827", textAlign: "right" },
  valuePlain: { color: "#111827", textAlign: "right" },
  dishBlock: {
    padding: "4px 0",
  },
  dishTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "2px",
  },
  dishHeading: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 700,
    color: "#111827",
    minWidth: 0,
    flex: 1,
  },
  dishAmt: {
    margin: 0,
    fontSize: "12.5px",
    fontWeight: 800,
    color: "#ea580c",
    whiteSpace: "nowrap",
  },
  itemLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
    marginTop: "1px",
    paddingLeft: "6px",
  },
  itemLeft: {
    margin: 0,
    fontSize: "10px",
    color: "#6b7280",
    lineHeight: 1.25,
    minWidth: 0,
    flex: 1,
  },
  itemRight: {
    margin: 0,
    fontSize: "10px",
    fontWeight: 500,
    color: "#9ca3af",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  dateLine: {
    margin: "2px 0 0",
    paddingLeft: "6px",
    fontSize: "10px",
    color: "#6b7280",
    lineHeight: 1.35,
  },
  dateMonth: {
    fontWeight: 700,
    color: "#374151",
  },
  totalLabel: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#111827",
  },
  totalValue: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f97316",
  },
  footer: {
    margin: 0,
    textAlign: "center",
    fontSize: "10px",
    color: "#9ca3af",
    lineHeight: 1.5,
  },
};

const CalendarBillPreviewModal = ({ open, bill, onClose, variant = "bill" }) => {
  const toast = useToastStore();
  const billRef = useRef(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [exporting, setExporting] = useState(null);

  if (!open || !bill) return null;

  const isReminder = variant === "reminder";
  const reminderCount = Number(bill.reminder_count || 0);
  const dishes = bill.dishes || [];
  const calc = calcCalendarBill(dishes);
  const grandTotal = Number(bill.total_amount ?? calc.grandTotal);
  const showDates = Boolean(bill.show_dates);

  const fileBase = isReminder
    ? `Arefas-Kitchen-Calendar-Reminder-${bill.customer_name || "bill"}-${reminderCount}`
    : `Arefas-Kitchen-Calendar-${bill.customer_name || "bill"}`;

  const captureBill = async () => {
    const node = billRef.current;
    if (!node) throw new Error("Bill not ready");

    return html2canvas(node, {
      scale: 4,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (doc, cloned) => {
        doc
          .querySelectorAll('style, link[rel="stylesheet"]')
          .forEach((el) => el.remove());

        cloned.style.color = "#111827";
        cloned.style.backgroundColor = "#ffffff";
        cloned.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';
      },
    });
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async () => {
    try {
      setExporting("image");
      setShowDownloadMenu(false);
      const canvas = await captureBill();
      await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create image"));
            return;
          }
          downloadBlob(blob, `${fileBase}.png`);
          resolve();
        }, "image/png");
      });
      toast.success("Downloaded", "Bill saved as image.");
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to download image.");
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setExporting("pdf");
      setShowDownloadMenu(false);
      const canvas = await captureBill();
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileBase}.pdf`);
      toast.success("Downloaded", "Bill saved as PDF.");
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to download PDF.");
    } finally {
      setExporting(null);
    }
  };

  const handleCopyText = async () => {
    try {
      const prefix = isReminder ? `*REMINDER #${reminderCount}*\n\n` : "";
      await navigator.clipboard.writeText(
        prefix + buildCalendarBillText(bill, calc)
      );
      toast.success("Copied", "Bill text copied successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to copy bill.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92dvh] overflow-hidden animate-slide-up flex flex-col"
      >
        <div className="shrink-0 flex justify-between items-center border-b px-5 py-4">
          <h2 className="font-bold text-xl">
            {isReminder ? "Reminder Preview" : "Calendar Bill Preview"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none bg-gray-100 p-4">
          <div ref={billRef} style={s.bill}>
            <div style={s.inner}>
              <div style={s.center}>
                {isReminder && (
                  <p style={s.reminderBanner}>Reminder #{reminderCount}</p>
                )}
                <h1 style={s.title}>Arefa's Kitchen</h1>
                <p style={s.subtitle}>Homemade Food</p>
                <p style={s.badge}>
                  {isReminder ? "Payment Reminder" : "Bill"}
                </p>
              </div>

              <div style={s.divider} />

              <div style={s.meta}>
                {bill.customer_name?.trim() && (
                  <div style={s.row}>
                    <span style={s.label}>Customer</span>
                    <span style={s.value}>{bill.customer_name.trim()}</span>
                  </div>
                )}
                {bill.customer_mobile?.trim() && (
                  <div style={s.row}>
                    <span style={s.label}>Mobile</span>
                    <span style={s.valuePlain}>
                      {bill.customer_mobile.trim()}
                    </span>
                  </div>
                )}
                {calc.fromDate && calc.toDate ? (
                  <div style={s.row}>
                    <span style={s.label}>Period</span>
                    <span style={s.valuePlain}>
                      {formatShortDate(calc.fromDate)} →{" "}
                      {formatShortDate(calc.toDate)}
                    </span>
                  </div>
                ) : null}
              </div>

              <div style={s.divider} />

              {dishes.map((dish, idx) => {
                const summary = calc.dishSummaries[idx] || calcDishTotals(dish);
                const delivery = Number(dish.delivery_charge_per_day) || 0;
                const dateGroups = showDates
                  ? formatDateGroups(summary.dates)
                  : [];

                return (
                  <div key={dish.dish_entry_id || dish.localId || idx}>
                    {idx > 0 ? <div style={s.hairline} /> : null}
                    <div style={s.dishBlock}>
                      <div style={s.dishTop}>
                        <p style={s.dishHeading}>
                          {dish.dish_name || `Dish ${idx + 1}`}
                        </p>
                        <p style={s.dishAmt}>
                          {formatMoney(summary.dishTotal)}
                        </p>
                      </div>

                      <div style={s.itemLine}>
                        <p style={s.itemLeft}>
                          {Number(dish.quantity) || 1}×
                          {formatMoney(dish.rate_per_day)}/day ·{" "}
                          {summary.dayCount}d
                          {delivery > 0
                            ? ` · +${formatMoney(delivery)} del`
                            : ""}
                        </p>
                        <p style={s.itemRight}>
                          {formatMoney(summary.dayAmount)}/d
                        </p>
                      </div>

                      {dateGroups.map((g) => {
                        const [monthPart, ...rest] = g.text.split(": ");
                        const daysPart = rest.join(": ");
                        return (
                          <p key={g.key} style={s.dateLine}>
                            <span style={s.dateMonth}>{monthPart}:</span>{" "}
                            {daysPart}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div style={s.divider} />

              <div
                style={{
                  ...s.dividerSolid,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={s.totalLabel}>Total</span>
                <span style={s.totalValue}>{formatMoney(grandTotal)}</span>
              </div>

              <div style={{ ...s.divider, marginTop: 14 }} />

              <p style={s.footer}>
                Thank you for your order!
                <br />
                Homemade with care · Arefa's Kitchen
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t p-4 space-y-2.5 relative bg-white">
          <div className="flex gap-3 relative">
            <div className="relative flex-1">
              <button
                type="button"
                disabled={!!exporting}
                onClick={() => setShowDownloadMenu((prev) => !prev)}
                className="w-full border border-gray-200 rounded-xl py-3 font-semibold text-gray-800 flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
              >
                {exporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download
                    <ChevronUp
                      size={14}
                      className={`text-gray-400 transition ${
                        showDownloadMenu ? "" : "rotate-180"
                      }`}
                    />
                  </>
                )}
              </button>

              {showDownloadMenu && !exporting && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium active:bg-orange-50 border-b border-gray-100"
                  >
                    <ImageIcon size={16} className="text-orange-500" />
                    Download as Image
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium active:bg-orange-50"
                  >
                    <FileText size={16} className="text-orange-500" />
                    Download as PDF
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex-1 bg-orange-500 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <Copy size={16} />
              Copy Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarBillPreviewModal;
