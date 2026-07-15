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

const PHONES = "9637204353/7030734568";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const pad2 = (n) => String(n).padStart(2, "0");

const toLocalDate = (value) => {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** DD/MM/YYYY */
const formatDateSlash = (value) => {
  const d = toLocalDate(value);
  if (!d) return "";
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** DD/MM/YY */
const formatDateSlashShort = (value) => {
  const d = toLocalDate(value);
  if (!d) return "";
  const yy = String(d.getFullYear()).slice(-2);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${yy}`;
};

const orderBySaturdayDate = (specialDate) => {
  const d = toLocalDate(specialDate);
  if (!d) return null;
  const sat = new Date(d);
  sat.setDate(sat.getDate() - 1);
  return sat;
};

const orderBySaturdayCopyLabel = (specialDate) => {
  const sat = orderBySaturdayDate(specialDate);
  if (!sat) return null;
  return `Saturday, ${formatDateSlashShort(sat)}`;
};

const orderBySaturdayPosterLabel = (specialDate) => {
  const sat = orderBySaturdayDate(specialDate);
  if (!sat) return null;
  return `Saturday, ${formatDateSlash(sat)}`;
};

/** hex-only styles — html2canvas cannot parse Tailwind v4 oklch() colors */
const s = {
  poster: {
    backgroundColor: "#ffffff",
    width: "260px",
    maxWidth: "260px",
    margin: "0 auto",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#111827",
    boxSizing: "border-box",
  },
  inner: {
    padding: "16px 12px 14px",
    boxSizing: "border-box",
  },
  center: { textAlign: "center" },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#6b7280",
  },
  badge: {
    margin: "7px 0 0",
    fontSize: "11px",
    fontWeight: 700,
    color: "#f97316",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  date: {
    margin: "4px 0 0",
    fontSize: "12px",
    fontWeight: 700,
    color: "#374151",
  },
  divider: {
    borderTop: "1px dashed #d1d5db",
    margin: "12px 0",
  },
  dish: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  imageWrap: {
    width: "84px",
    height: "84px",
    flexShrink: 0,
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    border: "2px solid #000000",
    boxSizing: "border-box",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontSize: "11px",
    fontWeight: 600,
    backgroundColor: "#f9fafb",
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    textAlign: "left",
  },
  dishName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.25,
  },
  dishMeta: {
    margin: "3px 0 0",
    fontSize: "12px",
    fontWeight: 600,
    color: "#4b5563",
  },
  dishPrice: {
    margin: "4px 0 0",
    fontSize: "16px",
    fontWeight: 800,
    color: "#f97316",
  },
  dishNote: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#6b7280",
    fontStyle: "italic",
    lineHeight: 1.35,
  },
  footer: {
    margin: 0,
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 800,
    color: "#f97316",
  },
  deadline: {
    margin: "8px 0 0",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: 600,
    color: "#374151",
    lineHeight: 1.35,
  },
  thanks: {
    margin: "8px 0 0",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: 600,
    color: "#6b7280",
  },
  phones: {
    margin: "4px 0 0",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "0.01em",
  },
};

const buildPosterText = (special) => {
  const title = (special.title?.trim() || "Sunday Special").toUpperCase();
  const dateSlash = formatDateSlash(special.special_date);
  const saturday = orderBySaturdayCopyLabel(special.special_date);
  const items = special.items || [];

  const dishes = items
    .map((item, idx) => {
      const name = item.dish_name?.trim() || "Dish";
      const qty = item.quantity?.trim();
      const price = Number(item.price || 0);
      const qtyPart = qty ? ` (${qty})` : "";
      return `${idx + 1}. ${name}${qtyPart} = *${price}/-*`;
    })
    .join("\n");

  const deadlineLine = saturday
    ? `Place your order by *${saturday}*`
    : "Place your order by *Saturday*";

  return `*__Arefa's Kitchen__*

      *${title}*
   ${dateSlash} (LUNCH)


${dishes}


*FREE DELIVERY!*

${deadlineLine}

Thank you.
*${PHONES}*`;
};

const PosterPreviewModal = ({ open, special, onClose }) => {
  const toast = useToastStore();
  const posterRef = useRef(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [exporting, setExporting] = useState(null);

  if (!open || !special) return null;

  const title = special.title?.trim() || "Sunday Special";
  const dateSlash = formatDateSlash(special.special_date);
  const saturdayLabel = orderBySaturdayPosterLabel(special.special_date);
  const fileBase = `Arefas-Kitchen-${title.replace(/\s+/g, "-")}-${
    dateSlash.replace(/\//g, "-") || "special"
  }`;

  const capturePoster = async () => {
    const node = posterRef.current;
    if (!node) throw new Error("Poster not ready");

    return html2canvas(node, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (doc, cloned) => {
        doc
          .querySelectorAll('style, link[rel="stylesheet"]')
          .forEach((el) => el.remove());

        cloned.style.color = "#111827";
        cloned.style.backgroundColor = "#ffffff";
        cloned.style.fontFamily = "Arial, Helvetica, sans-serif";
        cloned.style.width = "260px";
        cloned.style.maxWidth = "260px";
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

      const canvas = await capturePoster();

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

      toast.success("Downloaded", "Poster saved as image.");
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

      const canvas = await capturePoster();
      const imgData = canvas.toDataURL("image/png");

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 70;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileBase}.pdf`);

      toast.success("Downloaded", "Poster saved as PDF.");
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to download PDF.");
    } finally {
      setExporting(null);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildPosterText(special));
      toast.success("Copied", "Poster text copied successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to copy text.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92dvh] overflow-hidden animate-slide-up flex flex-col"
      >
        <div className="shrink-0 flex justify-between items-center border-b px-5 py-4">
          <h2 className="font-bold text-xl">Poster Preview</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none bg-gray-100 p-3 sm:p-4 overflow-x-auto">
          <div ref={posterRef} style={s.poster}>
            <div style={s.inner}>
              <div style={s.center}>
                <h1 style={s.title}>Arefa's Kitchen</h1>
                <p style={s.subtitle}>Homemade Food</p>
                <p style={s.badge}>{title}</p>
                {dateSlash && (
                  <p style={s.date}>
                    {dateSlash} (LUNCH)
                  </p>
                )}
              </div>

              <div style={s.divider} />

              {(special.items || []).map((item, idx) => (
                <div
                  key={
                    item.item_id || item.localId || `${item.dish_name}-${idx}`
                  }
                  style={s.dish}
                >
                  <div style={s.imageWrap}>
                    {item.imagePreview ? (
                      <img
                        src={item.imagePreview}
                        alt={item.dish_name || `Dish ${idx + 1}`}
                        style={s.image}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div style={s.placeholder}>No Image</div>
                    )}
                  </div>

                  <div style={s.textCol}>
                    <p style={s.dishName}>{item.dish_name || "Dish"}</p>
                    {item.quantity?.trim() && (
                      <p style={s.dishMeta}>{item.quantity.trim()}</p>
                    )}
                    <p style={s.dishPrice}>{formatMoney(item.price)}</p>
                    {item.note?.trim() && (
                      <p style={s.dishNote}>{item.note.trim()}</p>
                    )}
                  </div>
                </div>
              ))}

              <div style={s.divider} />
              <p style={s.footer}>FREE DELIVERY!</p>
              <p style={s.deadline}>
                Place your order by{" "}
                {saturdayLabel || "Saturday"}
              </p>
              <p style={s.thanks}>Thank you.</p>
              <p style={s.phones}>{PHONES}</p>
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

export default PosterPreviewModal;
