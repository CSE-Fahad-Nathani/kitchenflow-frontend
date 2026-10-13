/**
 * Build route stops from today's orders + manual stops + customer master data.
 * Identification is customer_id only — never match by name.
 */

export const buildRouteStops = ({
  orders = [],
  manualStops = [],
  customers = [],
  customerCache = {},
} = {}) => {
  const byId = new Map(
    (customers || [])
      .filter((c) => c?.customer_id)
      .map((c) => [c.customer_id, c])
  );

  const fromOrders = (orders || []).map((order) => {
    const customerId = order.customer_id || null;
    const master = customerId ? byId.get(customerId) : null;
    const cached = customerId ? customerCache[customerId] : null;

    const name =
      cached?.name ||
      master?.name ||
      order.customer_name ||
      "Customer";

    const mobile =
      cached?.mobile ??
      master?.mobile ??
      order.customer_mobile ??
      "";

    const address = cached?.address ?? master?.address ?? "";
    const notes = cached?.notes ?? master?.notes ?? "";

    return {
      stop_id: order.order_id,
      kind: "order",
      order_id: order.order_id,
      order_number: order.order_number,
      delivery_datetime: order.delivery_datetime,
      total_amount: order.total_amount,
      is_paid: Boolean(order.is_paid),
      bill_notes: order.bill_notes || "",
      items: order.items || [],
      customer_id: customerId,
      customer_name: name,
      customer_mobile: mobile || "",
      customer_address: address || "",
      customer_notes: notes || "",
      linked: Boolean(customerId && master),
      canEditCustomer: Boolean(customerId),
    };
  });

  const orderCustomerIds = new Set(
    fromOrders.map((s) => s.customer_id).filter(Boolean)
  );

  const fromManual = (manualStops || [])
    .filter((s) => s?.stop_id)
    // Prefer the order stop if same customer already has a today order
    .filter((s) => !orderCustomerIds.has(s.customer_id))
    .map((s) => {
      const customerId = s.customer_id || null;
      const master = customerId ? byId.get(customerId) : null;
      const cached = customerId ? customerCache[customerId] : null;

      return {
        stop_id: s.stop_id,
        kind: "manual",
        order_id: null,
        order_number: null,
        delivery_datetime: null,
        total_amount: null,
        is_paid: false,
        bill_notes: "",
        items: [],
        customer_id: customerId,
        customer_name:
          cached?.name || master?.name || s.customer_name || "Customer",
        customer_mobile:
          cached?.mobile ?? master?.mobile ?? s.customer_mobile ?? "",
        customer_address:
          cached?.address ?? master?.address ?? s.customer_address ?? "",
        customer_notes:
          cached?.notes ?? master?.notes ?? s.customer_notes ?? "",
        linked: Boolean(customerId && master),
        canEditCustomer: Boolean(customerId),
      };
    });

  return [...fromOrders, ...fromManual];
};

/** Ranked first (by sequence), then unranked (stable by name). */
export const partitionStops = (stops = [], rankedIds = []) => {
  const byStopId = new Map(stops.map((s) => [s.stop_id, s]));
  const ranked = rankedIds
    .map((id) => byStopId.get(id))
    .filter(Boolean)
    .map((stop, index) => ({ ...stop, rank: index + 1 }));

  const rankedSet = new Set(rankedIds);
  const unranked = stops
    .filter((s) => !rankedSet.has(s.stop_id))
    .map((stop) => ({ ...stop, rank: null }))
    .sort((a, b) =>
      String(a.customer_name || "").localeCompare(String(b.customer_name || ""))
    );

  return { ranked, unranked };
};

export const digitsOnlyPhone = (mobile = "") =>
  String(mobile || "").replace(/\D/g, "");

export const whatsappUrl = (mobile = "") => {
  let digits = digitsOnlyPhone(mobile);
  if (!digits) return null;
  if (digits.length === 10) digits = `91${digits}`;
  return `https://wa.me/${digits}`;
};

export const mapsSearchUrl = (address = "") => {
  const q = String(address || "").trim();
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
};
