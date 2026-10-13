import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { formatDisplayTime } from "./formatDate";

const FONT =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const el = (tag, styles = {}, children = []) => {
  const node = document.createElement(tag);
  Object.assign(node.style, styles);
  for (const child of children) {
    if (child == null || child === false) continue;
    if (typeof child === "string" || typeof child === "number") {
      node.appendChild(document.createTextNode(String(child)));
    } else {
      node.appendChild(child);
    }
  }
  return node;
};

const buildCover = ({ dateLabel, stopCount, doneCount }) =>
  el(
    "div",
    {
      width: "340px",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      overflow: "hidden",
      fontFamily: FONT,
      color: "#111827",
    },
    [
      el(
        "div",
        {
          backgroundColor: "#f97316",
          padding: "22px 18px 20px",
          boxSizing: "border-box",
        },
        [
          el(
            "p",
            {
              margin: "0",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#ffedd5",
            },
            ["KitchenFlow"]
          ),
          el(
            "h1",
            {
              margin: "8px 0 0",
              fontSize: "26px",
              fontWeight: "800",
              letterSpacing: "-0.03em",
              color: "#ffffff",
              lineHeight: "1.15",
            },
            ["Delivery Route"]
          ),
          el(
            "p",
            {
              margin: "8px 0 0",
              fontSize: "13px",
              fontWeight: "600",
              color: "#ffedd5",
            },
            [dateLabel]
          ),
        ]
      ),
      el(
        "div",
        {
          padding: "16px 18px 18px",
          boxSizing: "border-box",
          display: "flex",
          gap: "10px",
        },
        [
          el(
            "div",
            {
              flex: "1",
              backgroundColor: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: "12px",
              padding: "12px",
              boxSizing: "border-box",
              textAlign: "center",
            },
            [
              el(
                "p",
                {
                  margin: "0",
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#ea580c",
                },
                [String(stopCount)]
              ),
              el(
                "p",
                {
                  margin: "4px 0 0",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#c2410c",
                },
                ["Stops"]
              ),
            ]
          ),
          el(
            "div",
            {
              flex: "1",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "12px",
              padding: "12px",
              boxSizing: "border-box",
              textAlign: "center",
            },
            [
              el(
                "p",
                {
                  margin: "0",
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#059669",
                },
                [String(doneCount)]
              ),
              el(
                "p",
                {
                  margin: "4px 0 0",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#047857",
                },
                ["Done"]
              ),
            ]
          ),
        ]
      ),
    ]
  );

const buildStopCard = (stop, { index, total, isDone }) => {
  const phone = (stop.customer_mobile || "").trim();
  const address = (stop.customer_address || "").trim();
  const notes = (stop.customer_notes || "").trim();
  const billNotes = (stop.bill_notes || "").trim();
  const timeLabel = formatDisplayTime(stop.delivery_datetime);
  const isOrder = stop.kind === "order";
  const items = Array.isArray(stop.items) ? stop.items : [];

  const metaBits = [];
  if (stop.order_number) metaBits.push(`#${stop.order_number}`);
  if (timeLabel) metaBits.push(timeLabel);
  if (stop.kind === "manual") metaBits.push("Extra stop");
  if (stop.total_amount != null) metaBits.push(money(stop.total_amount));

  const statusLabel = isDone
    ? "Done"
    : isOrder
      ? stop.is_paid
        ? "Paid"
        : "Unpaid"
      : "Stop";
  const statusBg = isDone
    ? "#059669"
    : isOrder && stop.is_paid
      ? "#059669"
      : isOrder
        ? "#dc2626"
        : "#6b7280";

  const field = (label, value, muted = false) =>
    el(
      "div",
      {
        marginTop: "10px",
      },
      [
        el(
          "p",
          {
            margin: "0",
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#9ca3af",
          },
          [label]
        ),
        el(
          "p",
          {
            margin: "4px 0 0",
            fontSize: "13.5px",
            fontWeight: muted ? "500" : "600",
            lineHeight: "1.35",
            color: muted ? "#9ca3af" : "#111827",
            fontStyle: muted ? "italic" : "normal",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          },
          [value]
        ),
      ]
    );

  return el(
    "div",
    {
      width: "340px",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
      border: isDone ? "1px solid #a7f3d0" : "1px solid #e5e7eb",
      borderRadius: "16px",
      overflow: "visible",
      fontFamily: FONT,
      color: "#111827",
    },
    [
      el(
        "div",
        {
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "10px",
          padding: "14px 14px 16px",
          boxSizing: "border-box",
          backgroundColor: isDone ? "#ecfdf5" : "#fff7ed",
          borderBottom: isDone ? "1px solid #a7f3d0" : "1px solid #fed7aa",
          borderTopLeftRadius: "15px",
          borderTopRightRadius: "15px",
          overflow: "visible",
        },
        [
          el(
            "div",
            {
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              minWidth: "0",
              flex: "1",
              overflow: "visible",
            },
            [
              el(
                "div",
                {
                  position: "relative",
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  backgroundColor: isDone ? "#059669" : "#f97316",
                  flexShrink: "0",
                  overflow: "hidden",
                },
                [
                  el(
                    "div",
                    {
                      position: "absolute",
                      left: "0",
                      width: "34px",
                      // html2canvas drops glyphs low — bias upward for true optical center
                      top: "4px",
                      height: "16px",
                      lineHeight: "16px",
                      textAlign: "center",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "800",
                    },
                    [String(index + 1)]
                  ),
                ]
              ),
              el(
                "div",
                {
                  minWidth: "0",
                  flex: "1",
                  overflow: "visible",
                  paddingTop: "1px",
                },
                [
                  el(
                    "p",
                    {
                      margin: "0",
                      fontSize: "11px",
                      fontWeight: "700",
                      lineHeight: "1.35",
                      color: isDone ? "#047857" : "#c2410c",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    },
                    [`Stop ${index + 1} of ${total}`]
                  ),
                  el(
                    "p",
                    {
                      margin: "4px 0 0",
                      fontSize: "12px",
                      fontWeight: "600",
                      lineHeight: "1.4",
                      color: "#6b7280",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    },
                    [metaBits.join(" · ") || "Today"]
                  ),
                ]
              ),
            ]
          ),
          el(
            "div",
            {
              position: "relative",
              flexShrink: "0",
              marginTop: "2px",
              height: "24px",
              // Width from label length so absolute text still fits
              width: `${Math.max(54, statusLabel.length * 8 + 20)}px`,
              borderRadius: "999px",
              backgroundColor: statusBg,
              overflow: "hidden",
            },
            [
              el(
                "div",
                {
                  position: "absolute",
                  left: "0",
                  width: "100%",
                  // Same upward bias that fixed the stop number circle
                  top: "3px",
                  height: "12px",
                  lineHeight: "12px",
                  textAlign: "center",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "800",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                },
                [statusLabel]
              ),
            ]
          ),
        ]
      ),
      el(
        "div",
        {
          padding: "14px 14px 16px",
          boxSizing: "border-box",
        },
        [
          el(
            "h2",
            {
              margin: "0",
              fontSize: "20px",
              fontWeight: "800",
              letterSpacing: "-0.02em",
              lineHeight: "1.2",
              color: "#111827",
              wordBreak: "break-word",
            },
            [stop.customer_name || "Customer"]
          ),
          field("Phone", phone || "No phone", !phone),
          field("Address", address || "No address saved", !address),
          field("Customer notes", notes || "No notes", !notes),
          billNotes
            ? field("Bill notes", billNotes)
            : null,
          items.length
            ? el(
                "div",
                {
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f3f4f6",
                },
                [
                  el(
                    "div",
                    {
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "8px",
                    },
                    [
                      el(
                        "p",
                        {
                          margin: "0",
                          fontSize: "10px",
                          fontWeight: "700",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                        },
                        ["Order"]
                      ),
                      stop.total_amount != null
                        ? el(
                            "p",
                            {
                              margin: "0",
                              fontSize: "15px",
                              fontWeight: "800",
                              color: "#ea580c",
                            },
                            [money(stop.total_amount)]
                          )
                        : null,
                    ]
                  ),
                  ...items.map((item) =>
                    el(
                      "div",
                      {
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginBottom: "6px",
                      },
                      [
                        el(
                          "div",
                          { minWidth: "0", flex: "1" },
                          [
                            el(
                              "p",
                              {
                                margin: "0",
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#111827",
                                lineHeight: "1.3",
                              },
                              [
                                `${item.quantity}× ${item.dish_name || "Item"}`,
                              ]
                            ),
                            item.variant_name
                              ? el(
                                  "p",
                                  {
                                    margin: "2px 0 0",
                                    fontSize: "11px",
                                    color: "#6b7280",
                                  },
                                  [item.variant_name]
                                )
                              : null,
                          ]
                        ),
                        el(
                          "p",
                          {
                            margin: "0",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            color: "#4b5563",
                            flexShrink: "0",
                          },
                          [money(item.total_price)]
                        ),
                      ]
                    )
                  ),
                ]
              )
            : null,
        ]
      ),
    ]
  );
};

const captureNode = async (node) => {
  const canvas = await html2canvas(node, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    onclone: (doc, cloned) => {
      doc
        .querySelectorAll('style, link[rel="stylesheet"]')
        .forEach((styleEl) => styleEl.remove());
      cloned.style.color = "#111827";
      cloned.style.backgroundColor = "#ffffff";
      cloned.style.fontFamily = FONT;
    },
  });
  return canvas;
};

/**
 * Download ranked delivery stops as a printable PDF (one designed card per stop).
 */
export const downloadDeliveryRoutePdf = async ({
  stops = [],
  completedIds = [],
  dateLabel = "",
} = {}) => {
  if (!stops.length) {
    throw new Error("No ranked stops to export");
  }

  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:360px;pointer-events:none;opacity:0;";
  document.body.appendChild(host);

  try {
    const doneCount = completedIds.filter((id) =>
      stops.some((s) => s.stop_id === id)
    ).length;

    const cover = buildCover({
      dateLabel,
      stopCount: stops.length,
      doneCount,
    });
    host.appendChild(cover);

    const cards = stops.map((stop, index) => {
      const card = buildStopCard(stop, {
        index,
        total: stops.length,
        isDone: completedIds.includes(stop.stop_id),
      });
      host.appendChild(card);
      return card;
    });

    // Let layout settle before capture
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const coverCanvas = await captureNode(cover);
    const cardCanvases = [];
    for (const card of cards) {
      cardCanvases.push(await captureNode(card));
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const gap = 6;
    const contentW = pageW - margin * 2;

    const drawCanvas = (canvas, x, y, maxW) => {
      const w = maxW;
      const h = (canvas.height * w) / canvas.width;
      const img = canvas.toDataURL("image/png");
      pdf.addImage(img, "PNG", x, y, w, h);
      return h;
    };

    let y = margin;
    const coverH = drawCanvas(coverCanvas, margin, y, contentW);
    y += coverH + gap;

    for (let i = 0; i < cardCanvases.length; i += 1) {
      const canvas = cardCanvases[i];
      const cardH = (canvas.height * contentW) / canvas.width;

      if (y + cardH > pageH - margin) {
        pdf.addPage();
        y = margin;
      }

      const drawnH = drawCanvas(canvas, margin, y, contentW);
      y += drawnH + gap;
    }

    const safeDate = String(dateLabel || "today").replace(/[^\d-]/g, "") || "today";
    pdf.save(`KitchenFlow-Delivery-Route-${safeDate}.pdf`);
  } finally {
    host.remove();
  }
};
