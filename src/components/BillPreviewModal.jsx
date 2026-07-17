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
import { useToastStore } from "../store/toastStore";
import { formatDisplayDate, formatDisplayTime } from "../utils/formatDate";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDelivery = (datetime) => ({
  date: formatDisplayDate(datetime),
  time: formatDisplayTime(datetime),
});

/** hex-only styles — html2canvas cannot parse Tailwind v4 oklch() colors */
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
    margin: "16px 0",
  },
  dividerSolid: {
    borderTop: "1px solid #e5e7eb",
    margin: "8px 0 0",
    paddingTop: "12px",
  },
  meta: {
    fontSize: "13px",
    color: "#374151",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "6px",
  },
  label: { color: "#6b7280" },
  value: { fontWeight: 600, color: "#111827", textAlign: "right" },
  valuePlain: { color: "#111827", textAlign: "right" },
  colHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  itemName: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.35,
  },
  itemMeta: {
    margin: "2px 0 0",
    fontSize: "12px",
    color: "#6b7280",
  },
  itemAmt: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    color: "#111827",
    whiteSpace: "nowrap",
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
  reminderBanner: {
    margin: "0 0 10px",
    padding: "8px 10px",
    backgroundColor: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: 800,
    color: "#ea580c",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  paidNote: {
    margin: "10px 0 0",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.45,
  },
};

const BillPreviewModal = ({ open, order, onClose, variant = "bill" }) => {
  const toast = useToastStore();
  const billRef = useRef(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [exporting, setExporting] = useState(null);

  if (!open || !order) return null;

  const isReminder = variant === "reminder";
  const reminderCount = Number(order.reminder_count || 0);

  const { date: deliveryDate, time: deliveryTime } = formatDelivery(
    order.delivery_datetime
  );

  const fileBase = isReminder
    ? `Arefas-Kitchen-Reminder-${order.order_number || "order"}-${reminderCount}`
    : `Arefas-Kitchen-Bill-${order.order_number || "order"}`;

  const captureBill = async () => {
    const node = billRef.current;
    if (!node) throw new Error("Bill not ready");

    return html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      // Strip Tailwind stylesheets — v4 uses oklch() which html2canvas cannot parse
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

      toast.success(
        "Downloaded",
        isReminder ? "Reminder saved as image." : "Bill saved as image."
      );
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

      toast.success(
        "Downloaded",
        isReminder ? "Reminder saved as PDF." : "Bill saved as PDF."
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to download PDF.");
    } finally {
      setExporting(null);
    }
  };

  const handleCopyText = async () => {
    const customerName = order.customer_name?.trim();
    const customerMobile = order.customer_mobile?.trim();

    let customerLine = "";
    if (customerName && customerMobile) {
      customerLine = `${customerName} (${customerMobile})\n`;
    } else if (customerName) {
      customerLine = `${customerName}\n`;
    } else if (customerMobile) {
      customerLine = `${customerMobile}\n`;
    }

    const reminderHeader = isReminder
      ? `*REMINDER #${reminderCount}*\n\n`
      : "";

    const paidNote = isReminder
      ? `

If paid please share screenshot`
      : "";

    const billText = `${reminderHeader}*Arefa's Kitchen*

${customerLine}Delivery: ${deliveryDate} (${deliveryTime})
--------------------------------
${(order.items || [])
  .map(
    (item) =>
      `${item.dish_name}${
        item.variant_name ? ` (${item.variant_name})` : ""
      } = *₹${Number(item.total_price).toLocaleString("en-IN")}/-*`
  )
  .join("\n")}

Delivery Charge = *₹${Number(order.delivery_charge).toLocaleString("en-IN")}/-*${
      Number(order.discount) > 0
        ? `
Discount = *-₹${Number(order.discount).toLocaleString("en-IN")}/-*`
        : ""
    }

*Total = ₹${Number(order.total_amount).toLocaleString("en-IN")}/-*${paidNote}`;

    try {
      await navigator.clipboard.writeText(billText);
      toast.success(
        "Copied",
        isReminder
          ? "Reminder text copied successfully."
          : "Bill text copied successfully."
      );
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
            {isReminder ? "Reminder Preview" : "Bill Preview"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none bg-gray-100 p-4">
          {/* Bill uses hex inline styles only — safe for html2canvas */}
          <div ref={billRef} style={s.bill}>
            <div style={s.inner}>
              <div style={s.center}>
                {isReminder && (
                  <p style={s.reminderBanner}>
                    Reminder #{reminderCount}
                  </p>
                )}
                <h1 style={s.title}>Arefa's Kitchen</h1>
                <p style={s.subtitle}>Homemade Food</p>
                <p style={s.badge}>
                  {isReminder ? "Payment Reminder" : "Tax Invoice / Bill"}
                </p>
              </div>

              <div style={s.divider} />

              <div style={s.meta}>
                <div style={s.row}>
                  <span style={s.label}>Bill No</span>
                  <span style={s.value}>#{order.order_number}</span>
                </div>
                {order.customer_name?.trim() && (
                  <div style={s.row}>
                    <span style={s.label}>Customer</span>
                    <span style={s.value}>{order.customer_name.trim()}</span>
                  </div>
                )}
                {order.customer_mobile?.trim() && (
                  <div style={s.row}>
                    <span style={s.label}>Mobile</span>
                    <span style={s.valuePlain}>
                      {order.customer_mobile.trim()}
                    </span>
                  </div>
                )}
                <div style={s.row}>
                  <span style={s.label}>Delivery</span>
                  <span style={s.valuePlain}>
                    {deliveryDate}, {deliveryTime}
                  </span>
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.colHeader}>
                <span>Item</span>
                <span>Amount</span>
              </div>

              {(order.items || []).map((item, idx) => (
                <div
                  key={item.order_item_id || `${item.dish_name}-${idx}`}
                  style={s.itemRow}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={s.itemName}>{item.dish_name}</p>
                    <p style={s.itemMeta}>
                      {[item.variant_name, `× ${item.quantity}`]
                        .filter(Boolean)
                        .join(" · ")}
                      {Number(item.unit_price) > 0
                        ? ` · ${formatMoney(item.unit_price)} each`
                        : ""}
                    </p>
                  </div>
                  <p style={s.itemAmt}>{formatMoney(item.total_price)}</p>
                </div>
              ))}

              <div style={s.divider} />

              <div style={s.meta}>
                <div style={s.row}>
                  <span style={s.label}>Delivery</span>
                  <span style={s.valuePlain}>
                    {formatMoney(order.delivery_charge)}
                  </span>
                </div>

                {Number(order.discount) > 0 && (
                  <div style={s.row}>
                    <span style={s.label}>Discount</span>
                    <span style={s.valuePlain}>
                      -{formatMoney(order.discount)}
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
                  <span style={s.totalValue}>
                    {formatMoney(order.total_amount)}
                  </span>
                </div>
              </div>

              <div style={{ ...s.divider, marginTop: 20 }} />

              <p style={s.footer}>
                Thank you for your order!
                <br />
                Homemade with care · Arefa's Kitchen
              </p>

              {isReminder && (
                <p style={s.paidNote}>If paid please share screenshot</p>
              )}
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

export default BillPreviewModal;
