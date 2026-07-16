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
  calcDatewiseBill,
  calcDayTotals,
  itemLineTotal,
} from "../../utils/datewiseCalc";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const s = {
  bill: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: "340px",
    margin: "0 auto",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#111827",
    boxSizing: "border-box",
  },
  inner: {
    padding: "24px 20px 20px",
    boxSizing: "border-box",
  },
  center: { textAlign: "center" },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#6b7280",
  },
  badge: {
    margin: "8px 0 0",
    fontSize: "11px",
    fontWeight: 600,
    color: "#f97316",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  divider: {
    borderTop: "1px dashed #d1d5db",
    margin: "14px 0",
  },
  dividerSolid: {
    borderTop: "1px solid #e5e7eb",
    margin: "8px 0 0",
    paddingTop: "12px",
  },
  meta: { fontSize: "13px", color: "#374151" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "6px",
  },
  label: { color: "#6b7280" },
  value: { fontWeight: 600, color: "#111827", textAlign: "right" },
  valuePlain: { color: "#111827", textAlign: "right" },
  dateHeading: {
    margin: "0 0 8px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#f97316",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
    marginBottom: "6px",
  },
  itemName: {
    margin: 0,
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.3,
  },
  itemMeta: {
    margin: "1px 0 0",
    fontSize: "11px",
    color: "#6b7280",
  },
  itemAmt: {
    margin: 0,
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#111827",
    whiteSpace: "nowrap",
  },
  dayNote: {
    margin: "0 0 6px",
    fontSize: "11px",
    color: "#6b7280",
    fontStyle: "italic",
  },
  totalLabel: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
  },
  totalValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#f97316",
  },
  footer: {
    margin: 0,
    textAlign: "center",
    fontSize: "11px",
    color: "#9ca3af",
    lineHeight: 1.6,
  },
};

const itemLabel = (item) => {
  const name = item.dish_name || "Item";
  return item.variant_name?.trim()
    ? `${name} (${item.variant_name.trim()})`
    : name;
};

export const buildDatewiseCopyText = (bill) => {
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

  const days = bill.days || [];
  const dayBlocks = days
    .map((day) => {
      const lines = [
        formatShortDate(day.bill_date),
        ...(day.items || []).map(
          (item) =>
            `${itemLabel(item)} = *₹${itemLineTotal(item).toLocaleString("en-IN")}/-*`
        ),
      ];

      if (Number(day.delivery_charge) > 0) {
        lines.push(
          `Delivery = *₹${Number(day.delivery_charge).toLocaleString("en-IN")}/-*`
        );
      }

      return lines.join("\n");
    })
    .join("\n\n");

  const discountLine =
    Number(bill.discount) > 0
      ? `
Discount = *-₹${Number(bill.discount).toLocaleString("en-IN")}/-*`
      : "";

  const calc = calcDatewiseBill(days, bill.discount);
  const total = Number(bill.total_amount ?? calc.grandTotal);

  return `*Arefa's Kitchen*

${customerLine}
${dayBlocks}${discountLine}

*Total = ₹${total.toLocaleString("en-IN")}/-*`;
};

const DatewiseBillPreviewModal = ({ open, bill, onClose }) => {
  const toast = useToastStore();
  const billRef = useRef(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [exporting, setExporting] = useState(null);

  if (!open || !bill) return null;

  const days = bill.days || [];
  const calc = calcDatewiseBill(days, bill.discount);
  const grandTotal = Number(bill.total_amount ?? calc.grandTotal);
  const fileBase = `Arefas-Kitchen-Datewise-${bill.customer_name || "bill"}`;

  const captureBill = async () => {
    const node = billRef.current;
    if (!node) throw new Error("Bill not ready");

    return html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (doc, cloned) => {
        doc
          .querySelectorAll('style, link[rel="stylesheet"]')
          .forEach((el) => el.remove());

        cloned.style.color = "#111827";
        cloned.style.backgroundColor = "#ffffff";
        cloned.style.fontFamily = "Arial, Helvetica, sans-serif";
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

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 80;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

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
      await navigator.clipboard.writeText(buildDatewiseCopyText(bill));
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
          <h2 className="font-bold text-xl">Date-wise Bill Preview</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none bg-gray-100 p-4">
          <div ref={billRef} style={s.bill}>
            <div style={s.inner}>
              <div style={s.center}>
                <h1 style={s.title}>Arefa's Kitchen</h1>
                <p style={s.subtitle}>Homemade Food</p>
                <p style={s.badge}>Date-wise Bill</p>
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
              </div>

              {days.map((day, idx) => {
                const dayCalc = calcDayTotals(day);
                return (
                  <div key={day.day_id || day.localId || day.bill_date || idx}>
                    <div style={s.divider} />
                    <p style={s.dateHeading}>
                      {formatShortDate(day.bill_date)}
                    </p>
                    {day.note?.trim() ? (
                      <p style={s.dayNote}>{day.note.trim()}</p>
                    ) : null}

                    {(day.items || []).map((item, itemIdx) => (
                      <div
                        key={item.item_id || item.localId || itemIdx}
                        style={s.itemRow}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={s.itemName}>{itemLabel(item)}</p>
                          <p style={s.itemMeta}>
                            {[
                              `× ${Number(item.quantity) || 0}`,
                              Number(item.price) > 0
                                ? `${formatMoney(item.price)} each`
                                : null,
                              item.note?.trim() || null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <p style={s.itemAmt}>
                          {formatMoney(itemLineTotal(item))}
                        </p>
                      </div>
                    ))}

                    {Number(day.delivery_charge) > 0 && (
                      <div style={s.row}>
                        <span style={s.label}>Delivery</span>
                        <span style={s.valuePlain}>
                          {formatMoney(day.delivery_charge)}
                        </span>
                      </div>
                    )}

                    <div style={{ ...s.row, marginTop: 4, marginBottom: 0 }}>
                      <span style={s.label}>Day total</span>
                      <span style={s.value}>{formatMoney(dayCalc.dayTotal)}</span>
                    </div>
                  </div>
                );
              })}

              <div style={s.divider} />

              <div style={s.meta}>
                {Number(bill.discount) > 0 && (
                  <div style={s.row}>
                    <span style={s.label}>Discount</span>
                    <span style={s.valuePlain}>
                      -{formatMoney(bill.discount)}
                    </span>
                  </div>
                )}

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
              </div>

              <div style={{ ...s.divider, marginTop: 20 }} />

              <p style={s.footer}>
                Thank you for your order!
                <br />
                Homemade with care · Arefa's Kitchen
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t p-4 flex gap-3 relative bg-white">
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
  );
};

export default DatewiseBillPreviewModal;
