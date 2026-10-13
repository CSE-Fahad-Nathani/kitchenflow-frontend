import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  FileDown,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchTodaysOrders } from "../../api/dashboardApi";
import {
  fetchCustomers,
  searchCustomers,
  updateCustomer,
} from "../../api/customerApi";
import { markOrderPaid } from "../../api/orderApi";
import { createPaidExtra } from "../../api/customerCreditApi";
import CustomerModal from "../../components/CustomerModal";
import PaidExtraModal from "../../components/credits/PaidExtraModal";
import RoutePreview from "../../components/deliveryRoute/RoutePreview";
import { useToastStore } from "../../store/toastStore";
import { useDeliveryRouteStore } from "../../store/deliveryRouteStore";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  buildRouteStops,
  mapsSearchUrl,
  partitionStops,
  whatsappUrl,
} from "../../utils/deliveryRouteHelpers";
import { downloadDeliveryRoutePdf } from "../../utils/deliveryRoutePdf";
import {
  formatDisplayTime,
  toLocalDateInputValue,
} from "../../utils/formatDate";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const FieldRow = ({ label, value, emptyLabel, onEdit, canEdit }) => (
  <div className="flex items-start gap-2 py-1.5">
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`text-[13px] font-medium leading-snug mt-0.5 ${
          value ? "text-gray-800" : "text-gray-400 italic"
        }`}
      >
        {value || emptyLabel}
      </p>
    </div>
    {canEdit ? (
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="press-scale shrink-0 w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center"
      >
        <Pencil size={13} />
      </button>
    ) : null}
  </div>
);

const DeliveryRoute = () => {
  const navigate = useNavigate();
  const toast = useToastStore();

  const rankedIds = useDeliveryRouteStore((s) => s.rankedIds);
  const completedIds = useDeliveryRouteStore((s) => s.completedIds);
  const manualStops = useDeliveryRouteStore((s) => s.manualStops);
  const customerCache = useDeliveryRouteStore((s) => s.customerCache);
  const hydrateFromOrders = useDeliveryRouteStore((s) => s.hydrateFromOrders);
  const ensureRemoteHydrated = useDeliveryRouteStore(
    (s) => s.ensureRemoteHydrated
  );
  const remoteReady = useDeliveryRouteStore((s) => s.remoteReady);
  const sequenceSource = useDeliveryRouteStore((s) => s.sequenceSource);
  const assignRank = useDeliveryRouteStore((s) => s.assignRank);
  const clearRank = useDeliveryRouteStore((s) => s.clearRank);
  const clearAllRanks = useDeliveryRouteStore((s) => s.clearAllRanks);
  const moveStop = useDeliveryRouteStore((s) => s.moveStop);
  const toggleCompleted = useDeliveryRouteStore((s) => s.toggleCompleted);
  const patchCustomerCache = useDeliveryRouteStore((s) => s.patchCustomerCache);
  const addManualStop = useDeliveryRouteStore((s) => s.addManualStop);
  const removeManualStop = useDeliveryRouteStore((s) => s.removeManualStop);
  const clearCompleted = useDeliveryRouteStore((s) => s.clearCompleted);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addSuggestions, setAddSuggestions] = useState([]);
  const [addSearching, setAddSearching] = useState(false);
  const [listFilter, setListFilter] = useState("");
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [paidExtraStop, setPaidExtraStop] = useState(null);
  const [payingExtra, setPayingExtra] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const debouncedAddSearch = useDebouncedValue(addSearch, 350);

  const markStopPaidLocally = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.order_id === orderId ? { ...order, is_paid: true } : order
      )
    );
  };

  const loadRoute = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      // Local-first sequence: use local instantly, else wait for DB (may be slow when asleep)
      await ensureRemoteHydrated();

      const [todayOrders, customerList] = await Promise.all([
        fetchTodaysOrders(),
        fetchCustomers(),
      ]);
      setOrders(todayOrders || []);
      setCustomers(customerList || []);
      hydrateFromOrders(todayOrders || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to load today's delivery route.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allStops = useMemo(
    () =>
      buildRouteStops({
        orders,
        manualStops,
        customers,
        customerCache,
      }),
    [orders, manualStops, customers, customerCache]
  );

  const { ranked, unranked } = useMemo(
    () => partitionStops(allStops, rankedIds),
    [allStops, rankedIds]
  );

  const listQuery = listFilter.trim().toLowerCase();

  const rankedVisible = useMemo(() => {
    if (!listQuery) return ranked;
    return ranked.filter((s) =>
      String(s.customer_name || "")
        .toLowerCase()
        .includes(listQuery)
    );
  }, [ranked, listQuery]);

  const unrankedVisible = useMemo(() => {
    if (!listQuery) return unranked;
    return unranked.filter((s) =>
      String(s.customer_name || "")
        .toLowerCase()
        .includes(listQuery)
    );
  }, [unranked, listQuery]);

  const routeCustomerIds = useMemo(
    () => new Set(allStops.map((s) => s.customer_id).filter(Boolean)),
    [allStops]
  );

  useEffect(() => {
    if (!showAdd) return;

    if (!debouncedAddSearch.trim()) {
      setAddSuggestions([]);
      setAddSearching(false);
      return;
    }

    let cancelled = false;
    setAddSearching(true);

    searchCustomers(debouncedAddSearch)
      .then((data) => {
        if (cancelled) return;
        const list = (data || []).filter(
          (c) => c?.customer_id && !routeCustomerIds.has(c.customer_id)
        );
        setAddSuggestions(list);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setAddSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setAddSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedAddSearch, showAdd, routeCustomerIds]);

  const closeAddSheet = () => {
    setShowAdd(false);
    setAddSearch("");
    setAddSuggestions([]);
    setAddSearching(false);
  };

  const doneCount = completedIds.filter((id) =>
    allStops.some((s) => s.stop_id === id)
  ).length;

  const nextRankNumber = ranked.length + 1;

  const startPreview = (fromStopId = null) => {
    if (ranked.length === 0) {
      toast.warning(
        "No sequence yet",
        "Tap unranked customers to set order 1, 2, 3…"
      );
      return;
    }

    if (fromStopId) {
      const idx = ranked.findIndex((s) => s.stop_id === fromStopId);
      setPreviewIndex(idx >= 0 ? idx : 0);
      return;
    }

    const firstPending = ranked.findIndex(
      (s) => !completedIds.includes(s.stop_id)
    );
    setPreviewIndex(firstPending >= 0 ? firstPending : 0);
  };

  const handlePreviewNext = () => {
    if (previewIndex == null) return;
    if (previewIndex >= ranked.length - 1) {
      setPreviewIndex(null);
      return;
    }
    setPreviewIndex(previewIndex + 1);
  };

  const handlePreviewPrev = () => {
    if (previewIndex == null || previewIndex <= 0) return;
    setPreviewIndex(previewIndex - 1);
  };

  const handleDownloadRoutePdf = async () => {
    if (exportingPdf || ranked.length === 0) return;
    try {
      setExportingPdf(true);
      await downloadDeliveryRoutePdf({
        stops: ranked,
        completedIds,
        dateLabel: toLocalDateInputValue(),
      });
      toast.success("Downloaded", "Route PDF saved.");
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to download route PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handlePreviewMarkPaid = (stop) => {
    if (!stop?.order_id || stop.kind !== "order" || stop.is_paid || markingPaidId) {
      return;
    }

    toast.confirm({
      title: "Mark as Paid?",
      message: "This will mark the order as paid.",
      confirmLabel: "Mark Paid",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setMarkingPaidId(stop.order_id);
          await markOrderPaid(stop.order_id);
          markStopPaidLocally(stop.order_id);
          toast.success("Marked Paid", "Payment updated successfully.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to update payment.");
        } finally {
          setMarkingPaidId(null);
        }
      },
    });
  };

  const handleConfirmPaidExtra = async ({ amount, note }) => {
    if (!paidExtraStop?.order_id || payingExtra) return;

    try {
      setPayingExtra(true);
      await createPaidExtra({
        bill_type: "standard",
        bill_id: paidExtraStop.order_id,
        amount,
        note,
        customer_id: paidExtraStop.customer_id || null,
        customer_name: paidExtraStop.customer_name || "",
        customer_mobile: paidExtraStop.customer_mobile || "",
      });
      markStopPaidLocally(paidExtraStop.order_id);
      setPaidExtraStop(null);
      toast.success("Saved", "Marked paid and credit recorded.");
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed",
        error?.response?.data?.message || "Unable to save paid extra."
      );
    } finally {
      setPayingExtra(false);
    }
  };

  useEffect(() => {
    if (previewIndex == null) return;
    if (ranked.length === 0) {
      setPreviewIndex(null);
      return;
    }
    if (previewIndex >= ranked.length) {
      setPreviewIndex(ranked.length - 1);
    }
  }, [ranked.length, previewIndex]);

  const openEdit = (stop) => {
    if (!stop.customer_id) {
      toast.warning(
        "Not linked",
        "This stop has no customer_id. Select a saved customer first."
      );
      return;
    }

    setEditCustomer({
      customer_id: stop.customer_id,
      name: stop.customer_name || "",
      mobile: stop.customer_mobile || "",
      address: stop.customer_address || "",
      notes: stop.customer_notes || "",
    });
  };

  const handleSaveCustomer = async (form) => {
    if (!editCustomer?.customer_id) return;
    if (!form.name?.trim()) {
      toast.warning("Missing", "Customer name is required.");
      return;
    }

    try {
      setSaving(true);
      const response = await updateCustomer({
        customer_id: editCustomer.customer_id,
        name: form.name.trim(),
        mobile: form.mobile,
        address: form.address,
        notes: form.notes,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Update failed");
      }

      const saved = response.data || {};
      const patch = {
        name: saved.name ?? form.name.trim(),
        mobile: saved.mobile ?? form.mobile ?? "",
        address: saved.address ?? form.address ?? "",
        notes: saved.notes ?? form.notes ?? "",
      };

      patchCustomerCache(editCustomer.customer_id, patch);

      setCustomers((prev) =>
        prev.map((c) =>
          c.customer_id === editCustomer.customer_id ? { ...c, ...patch } : c
        )
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.customer_id === editCustomer.customer_id
            ? {
                ...o,
                customer_name: patch.name,
                customer_mobile: patch.mobile || "",
              }
            : o
        )
      );

      setEditCustomer(null);
      toast.success("Updated", "Customer details saved.");
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed",
        error?.response?.data?.message || "Could not update customer."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomer = (selected) => {
    const alreadyOnRoute = allStops.some(
      (s) => s.customer_id === selected.customer_id
    );
    if (alreadyOnRoute) {
      toast.warning("Already on route", "This customer is already listed.");
      closeAddSheet();
      return;
    }

    const result = addManualStop(selected);
    if (!result.ok) {
      toast.warning("Already added", "This customer is already on the route.");
      return;
    }

    closeAddSheet();
    toast.success(
      "Added",
      `${selected.name} is unranked — tap to set their sequence.`
    );
  };

  const renderStopCard = (stop, { rankedMode }) => {
    const done = completedIds.includes(stop.stop_id);
    const expanded = expandedId === stop.stop_id;
    const wa = whatsappUrl(stop.customer_mobile);
    const maps = mapsSearchUrl(stop.customer_address);
    const routeIndex = rankedIds.indexOf(stop.stop_id);
    const iconBtn =
      "press-scale w-8 h-8 shrink-0 rounded-full border bg-white inline-flex items-center justify-center";

    return (
      <article
        key={stop.stop_id}
        className={`rounded-xl border ${
          done
            ? "bg-emerald-50 border-emerald-200"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="p-3">
          <div className="flex items-start gap-2.5">
            {rankedMode ? (
              <div
                className={`shrink-0 min-w-8 h-8 px-2 rounded-full text-[12px] font-semibold inline-flex items-center justify-center gap-1 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : "bg-orange-500 text-white"
                }`}
              >
                {done ? <Check size={14} /> : null}
                <span>#{stop.rank}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                if (!rankedMode) assignRank(stop.stop_id);
                else setExpandedId(expanded ? null : stop.stop_id);
              }}
              className="min-w-0 flex-1 text-left"
            >
              <p className="text-[14px] font-semibold text-gray-900 truncate">
                {stop.customer_name}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">
                {stop.kind === "manual" ? (
                  <span className="text-orange-600">Extra stop</span>
                ) : (
                  <>#{stop.order_number}</>
                )}
                {stop.delivery_datetime ? (
                  <> · {formatDisplayTime(stop.delivery_datetime)}</>
                ) : null}
                {stop.total_amount != null ? (
                  <> · {money(stop.total_amount)}</>
                ) : null}
                {stop.is_paid ? " · Paid" : ""}
              </p>
              <p className="mt-1.5 text-[12px] text-gray-600 leading-snug line-clamp-2">
                {stop.customer_address || (
                  <span className="text-gray-400 italic">No address yet</span>
                )}
              </p>
            </button>

            {rankedMode ? (
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  disabled={routeIndex <= 0}
                  onClick={() => moveStop(stop.stop_id, "up")}
                  aria-label="Move up"
                  className={`${iconBtn} border-orange-200 text-orange-600 disabled:opacity-25`}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={
                    routeIndex < 0 || routeIndex >= rankedIds.length - 1
                  }
                  onClick={() => moveStop(stop.stop_id, "down")}
                  aria-label="Move down"
                  className={`${iconBtn} border-orange-200 text-orange-600 disabled:opacity-25`}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => assignRank(stop.stop_id)}
                className="press-scale shrink-0 h-8 px-2.5 rounded-full border border-dashed border-orange-300 bg-orange-50 text-orange-600 text-[11px] font-semibold inline-flex items-center justify-center gap-1"
                title={`Set as #${nextRankNumber}`}
                aria-label={`Rank as number ${nextRankNumber}`}
              >
                <span>+{nextRankNumber}</span>
                <span>Rank</span>
              </button>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            {rankedMode ? (
              <button
                type="button"
                onClick={() => startPreview(stop.stop_id)}
                aria-label="Preview"
                title="Preview"
                className="press-scale w-8 h-8 shrink-0 rounded-full bg-orange-500 text-white inline-flex items-center justify-center"
              >
                <Eye size={14} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => openEdit(stop)}
              aria-label="Edit"
              title="Edit"
              className={`${iconBtn} border-orange-200 bg-orange-50 text-orange-600`}
            >
              <Pencil size={13} />
            </button>

            <button
              type="button"
              onClick={() => toggleCompleted(stop.stop_id)}
              aria-label="Done"
              title="Done"
              className={`press-scale h-8 shrink-0 px-2.5 rounded-full border text-[11px] font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap ${
                done
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              <Check size={14} className="shrink-0" />
              <span>Done</span>
            </button>

            {stop.customer_mobile ? (
              <a
                href={`tel:${stop.customer_mobile}`}
                className={`${iconBtn} border-violet-200 bg-violet-50 text-violet-700`}
                aria-label="Call"
                title="Call"
              >
                <Phone size={13} />
              </a>
            ) : null}

            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className={`${iconBtn} border-emerald-200 bg-emerald-50 text-emerald-700`}
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <MessageCircle size={13} />
              </a>
            ) : null}

            {maps ? (
              <a
                href={maps}
                target="_blank"
                rel="noreferrer"
                className={`${iconBtn} border-sky-200 bg-sky-50 text-sky-700`}
                aria-label="Maps"
                title="Maps"
              >
                <MapPin size={13} />
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : stop.stop_id)}
              aria-label={expanded ? "Collapse" : "More"}
              title="More"
              className={`${iconBtn} ml-auto border-gray-300 bg-gray-100 text-gray-700`}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {expanded ? (
            <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1">
              {!stop.customer_id ? (
                <p className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 mb-1">
                  Not linked to a customer record — can’t save details to the
                  database.
                </p>
              ) : null}

              <FieldRow
                label="Name"
                value={stop.customer_name}
                emptyLabel="Required"
                canEdit={stop.canEditCustomer}
                onEdit={() => openEdit(stop)}
              />
              <FieldRow
                label="Phone"
                value={stop.customer_mobile}
                emptyLabel="No phone saved"
                canEdit={stop.canEditCustomer}
                onEdit={() => openEdit(stop)}
              />
              <FieldRow
                label="Address"
                value={stop.customer_address}
                emptyLabel="No address yet"
                canEdit={stop.canEditCustomer}
                onEdit={() => openEdit(stop)}
              />
              <FieldRow
                label="Customer details notes"
                value={stop.customer_notes}
                emptyLabel="No notes yet"
                canEdit={stop.canEditCustomer}
                onEdit={() => openEdit(stop)}
              />

              {stop.items?.length ? (
                <div className="pt-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Items
                  </p>
                  <ul className="space-y-1">
                    {stop.items.map((item) => (
                      <li
                        key={item.order_item_id}
                        className="flex justify-between gap-2 text-[12px]"
                      >
                        <span className="text-gray-700 font-medium min-w-0 truncate">
                          {item.quantity}× {item.dish_name}
                          {item.variant_name
                            ? ` (${item.variant_name})`
                            : ""}
                        </span>
                        <span className="text-gray-500 shrink-0">
                          {money(item.total_price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="pt-2 flex flex-wrap gap-2">
                {rankedMode ? (
                  <button
                    type="button"
                    onClick={() => clearRank(stop.stop_id)}
                    className="press-scale h-8 px-3 rounded-lg text-[12px] font-semibold text-gray-600 bg-gray-50 border border-gray-200"
                  >
                    Unrank
                  </button>
                ) : null}
                {stop.kind === "manual" ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeManualStop(stop.stop_id);
                      toast.info("Removed", "Extra stop removed from route.");
                    }}
                    className="press-scale h-8 px-3 rounded-lg text-[12px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 inline-flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-[calc(100dvh-4rem)] bg-gray-50 pb-28">
      <header className="px-4 pt-safe pb-4 bg-orange-500">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Back"
            className="press-scale mt-0.5 w-9 h-9 rounded-lg bg-white/15 border border-white/20 text-white flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-orange-100 text-[10px] font-semibold tracking-[0.12em] uppercase">
              Today · {toLocalDateInputValue()}
            </p>
            <h1 className="text-[1.35rem] font-bold text-white leading-tight mt-0.5">
              Delivery Route
            </h1>
            <p className="text-orange-100/90 text-[12px] mt-0.5">
              {loading
                ? "Loading…"
                : `${ranked.length} ranked · ${unranked.length} unranked · ${doneCount} done`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadRoute()}
            className="press-scale mt-0.5 h-9 px-3 rounded-lg bg-white/15 border border-white/20 text-white text-[12px] font-semibold"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => startPreview()}
            disabled={loading || ranked.length === 0}
            className="press-scale flex-1 h-10 rounded-xl bg-white text-orange-600 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Eye size={15} />
            Preview route
          </button>
          <button
            type="button"
            onClick={handleDownloadRoutePdf}
            disabled={loading || ranked.length === 0 || exportingPdf}
            aria-label="Download route PDF"
            title="Download PDF"
            className="press-scale h-10 px-3.5 rounded-xl bg-white/15 border border-white/25 text-white text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {exportingPdf ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FileDown size={15} />
            )}
            PDF
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="press-scale h-10 px-3.5 rounded-xl bg-white/15 border border-white/25 text-white text-[13px] font-semibold inline-flex items-center gap-1.5"
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </header>

      <div className="px-3.5 pt-3 space-y-4">
        <p className="text-[12px] text-gray-500 px-0.5 leading-relaxed">
          Tap an unranked customer to set them as{" "}
          <span className="font-semibold text-orange-600">#{nextRankNumber}</span>
          . Use arrows to fine-tune later.
        </p>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={listFilter}
            onChange={(e) => setListFilter(e.target.value)}
            placeholder="Search name on this route…"
            autoComplete="off"
            className="w-full h-9 bg-white border border-gray-200 rounded-xl pl-9 pr-9 text-[13px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          {listFilter ? (
            <button
              type="button"
              onClick={() => setListFilter("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-gray-400 flex items-center justify-center"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <div className="flex gap-2">
          {ranked.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                clearAllRanks();
                toast.info("Cleared", "All stops are unranked again.");
              }}
              className="press-scale h-8 px-3 rounded-lg text-[12px] font-semibold text-gray-600 bg-white border border-gray-200"
            >
              Clear sequence
            </button>
          ) : null}
          {doneCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                clearCompleted();
                toast.info("Cleared", "Done marks removed.");
              }}
              className="press-scale h-8 px-3 rounded-lg text-[12px] font-semibold text-gray-600 bg-white border border-gray-200"
            >
              Clear done
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-white border border-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : allStops.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-gray-900">
              No stops yet
            </p>
            <p className="mt-1 text-[12px] text-gray-500">
              Today’s orders appear here, or tap Add to include a customer.
            </p>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="press-scale mt-4 h-10 px-4 rounded-xl bg-orange-500 text-white text-[13px] font-semibold inline-flex items-center gap-1.5"
            >
              <UserPlus size={15} />
              Add customer
            </button>
          </div>
        ) : (
          <>
            <section className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-[12px] font-bold text-gray-700 tracking-wide">
                  Sequence ({rankedVisible.length}
                  {listQuery ? ` of ${ranked.length}` : ""})
                </h2>
              </div>
              {ranked.length === 0 ? (
                <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/50 px-3 py-4 text-[12px] text-orange-800/80">
                  {remoteReady && sequenceSource === "none"
                    ? "No sequence created yet — tap anyone below to make them #1."
                    : "Loading sequence…"}
                </div>
              ) : rankedVisible.length === 0 ? (
                <p className="text-[12px] text-gray-400 px-0.5">
                  No ranked matches for “{listFilter.trim()}”.
                </p>
              ) : (
                <div className="space-y-2">
                  {rankedVisible.map((stop) =>
                    renderStopCard(stop, { rankedMode: true })
                  )}
                </div>
              )}
            </section>

            <section className="space-y-2 pb-2">
              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-[12px] font-bold text-gray-700 tracking-wide">
                  Unranked ({unrankedVisible.length}
                  {listQuery ? ` of ${unranked.length}` : ""})
                </h2>
              </div>
              {unranked.length === 0 ? (
                <p className="text-[12px] text-gray-400 px-0.5">
                  All stops are in sequence.
                </p>
              ) : unrankedVisible.length === 0 ? (
                <p className="text-[12px] text-gray-400 px-0.5">
                  No unranked matches for “{listFilter.trim()}”.
                </p>
              ) : (
                <div className="space-y-2">
                  {unrankedVisible.map((stop) =>
                    renderStopCard(stop, { rankedMode: false })
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {showAdd ? (
        <div
          className="fixed inset-0 z-[70] bg-black/40 flex items-end"
          onClick={closeAddSheet}
        >
          <div
            className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-4 pb-safe max-h-[85dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider">
                  Route
                </p>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Add customer
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAddSheet}
                className="press-scale w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-[12px] text-gray-500 mb-2 shrink-0">
              Search and tap a suggestion to add — no bill required.
            </p>

            <div className="relative shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                placeholder="Customer name"
                autoComplete="off"
                autoFocus
                className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
              {addSearching ? (
                <Loader2
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 animate-spin"
                />
              ) : null}
            </div>

            <div className="mt-2 flex-1 min-h-0 overflow-y-auto scrollbar-none">
              {!addSearch.trim() ? (
                <p className="text-[12px] text-gray-400 px-1 py-4">
                  Start typing a name to see suggestions.
                </p>
              ) : addSearching ? (
                <p className="text-[12px] text-gray-400 px-1 py-4">Searching…</p>
              ) : addSuggestions.length === 0 ? (
                <p className="text-[12px] text-gray-400 px-1 py-4">
                  No matching customers found.
                </p>
              ) : (
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  {addSuggestions.map((customer) => (
                    <button
                      key={customer.customer_id}
                      type="button"
                      onClick={() => handleAddCustomer(customer)}
                      className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 active:bg-orange-50 border-b border-gray-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                        <User size={14} className="text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate text-[13px]">
                          {customer.name}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {customer.mobile || "No mobile"}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold text-orange-600">
                        Tap to add
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <CustomerModal
        open={Boolean(editCustomer)}
        customer={editCustomer}
        loading={saving}
        onClose={() => {
          if (!saving) setEditCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />

      {previewIndex != null && ranked[previewIndex] ? (
        <RoutePreview
          stops={ranked}
          index={previewIndex}
          completedIds={completedIds}
          onClose={() => setPreviewIndex(null)}
          onNext={handlePreviewNext}
          onPrev={handlePreviewPrev}
          onEdit={openEdit}
          onToggleDone={(id) => toggleCompleted(id)}
          onMarkPaid={handlePreviewMarkPaid}
          onCredit={(stop) => {
            if (stop?.kind === "order" && stop.order_id && !stop.is_paid) {
              setPaidExtraStop(stop);
            }
          }}
          markingPaid={
            Boolean(ranked[previewIndex]?.order_id) &&
            markingPaidId === ranked[previewIndex].order_id
          }
          payingExtra={
            payingExtra &&
            paidExtraStop?.order_id === ranked[previewIndex]?.order_id
          }
        />
      ) : null}

      <PaidExtraModal
        open={Boolean(paidExtraStop)}
        customerName={paidExtraStop?.customer_name || ""}
        billTotal={paidExtraStop?.total_amount}
        submitting={payingExtra}
        onClose={() => {
          if (!payingExtra) setPaidExtraStop(null);
        }}
        onConfirm={handleConfirmPaidExtra}
      />
    </div>
  );
};

export default DeliveryRoute;
