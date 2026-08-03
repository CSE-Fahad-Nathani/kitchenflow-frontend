import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Trash2, Eye } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  deleteCustomerCredit,
  fetchCustomerCredits,
  updateCustomerCredit,
} from "../../api/customerCreditApi";
import { fetchOrderById } from "../../api/orderApi";
import { fetchMonthlyTiffinBillById } from "../../api/monthlyTiffinApi";
import { fetchDatewiseBillById } from "../../api/datewiseBillApi";
import { fetchCalendarBillById } from "../../api/calendarBillApi";
import BillPreviewModal from "../../components/BillPreviewModal";
import TiffinBillPreviewModal from "../../components/monthlyTiffin/TiffinBillPreviewModal";
import DatewiseBillPreviewModal from "../../components/datewise/DatewiseBillPreviewModal";
import CalendarBillPreviewModal from "../../components/calendarBill/CalendarBillPreviewModal";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToastStore } from "../../store/toastStore";
import { formatDisplayDate, formatDisplayTime } from "../../utils/formatDate";

const BILL_TYPE_LABEL = {
  standard: "Standard",
  monthly_tiffin: "Monthly Tiffin",
  datewise: "Date-wise",
  calendar: "Calendar",
};

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Credits = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastStore();

  const routeFilter =
    location.pathname.endsWith("/today") ||
    new URLSearchParams(location.search).get("filter") === "today"
      ? "today"
      : "all";

  const [filter, setFilter] = useState(routeFilter);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setFilter(routeFilter);
  }, [routeFilter]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomerCredits({
          filter,
          search: debouncedSearch,
        });
        setCredits(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed", "Unable to load credits.");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, debouncedSearch]);

  const changeFilter = (next) => {
    setFilter(next);
    navigate(next === "today" ? "/credits/today" : "/credits", {
      replace: true,
    });
  };

  const totals = useMemo(() => {
    const sum = credits.reduce((s, c) => s + (Number(c.amount) || 0), 0);
    return { count: credits.length, sum };
  }, [credits]);

  const openEdit = (credit) => {
    setEditing(credit);
    setEditAmount(String(Number(credit.amount) || ""));
    setEditNote(credit.note || "");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editing || saving) return;
    const amount = Number(editAmount);
    if (!(amount > 0)) {
      toast.warning("Invalid", "Amount must be greater than 0.");
      return;
    }

    try {
      setSaving(true);
      const response = await updateCustomerCredit(editing.credit_id, {
        amount,
        note: editNote.trim(),
      });
      const updated = response.data;
      setCredits((prev) =>
        prev.map((c) => (c.credit_id === updated.credit_id ? updated : c))
      );
      setEditing(null);
      toast.success("Updated", "Credit corrected.");
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed",
        error?.response?.data?.message || "Unable to update credit."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (credit) => {
    toast.confirm({
      title: "Remove credit?",
      message: `Clear ₹${Number(credit.amount).toLocaleString("en-IN")} for ${
        credit.customer_name || "this customer"
      }?`,
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setDeletingId(credit.credit_id);
          await deleteCustomerCredit(credit.credit_id);
          setCredits((prev) =>
            prev.filter((c) => c.credit_id !== credit.credit_id)
          );
          toast.success("Removed", "Credit cleared.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to remove credit.");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handlePreviewBill = async (credit) => {
    try {
      setPreviewLoading(true);
      const { bill_type, bill_id } = credit;

      if (bill_type === "standard") {
        const bill = await fetchOrderById(bill_id);
        setPreview({ type: "standard", bill });
      } else if (bill_type === "monthly_tiffin") {
        const bill = await fetchMonthlyTiffinBillById(bill_id);
        setPreview({ type: "monthly_tiffin", bill });
      } else if (bill_type === "datewise") {
        const bill = await fetchDatewiseBillById(bill_id);
        setPreview({ type: "datewise", bill });
      } else if (bill_type === "calendar") {
        const bill = await fetchCalendarBillById(bill_id);
        setPreview({ type: "calendar", bill });
      } else {
        toast.error("Failed", "Unknown bill type.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to load linked bill.");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <header className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-safe pb-5 rounded-b-[1.5rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Back"
            className="press-scale mt-1 w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-orange-100 text-[10px] font-semibold tracking-[0.12em] uppercase">
              Arefa's Kitchen
            </p>
            <h1 className="text-[1.35rem] font-bold text-white leading-tight mt-0.5 tracking-tight">
              Customer Credits
            </h1>
            <p className="text-orange-100/90 text-[12px] mt-0.5">
              Extra payments to adjust later
            </p>
          </div>
        </div>
      </header>

      <div className="px-3.5 pt-3 space-y-3">
        <div className="flex gap-2">
          {[
            { id: "all", label: "All open" },
            { id: "today", label: "Today" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => changeFilter(tab.id)}
              className={`press-scale flex-1 h-9 rounded-xl text-[12px] font-semibold border ${
                filter === tab.id
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, mobile, note…"
          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />

        <div className="flex items-center justify-between px-0.5">
          <p className="text-[12px] text-gray-500">
            {totals.count} credit{totals.count === 1 ? "" : "s"}
          </p>
          <p className="text-[13px] font-bold text-orange-600">
            {money(totals.sum)}
          </p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center text-gray-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : credits.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-semibold text-gray-800">No credits</p>
            <p className="text-sm text-gray-500 mt-1">
              Use Paid Extra / Credit next to Mark Paid when a customer overpays
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {credits.map((credit) => (
              <div
                key={credit.credit_id}
                className="bg-white rounded-xl border border-gray-100 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[14px] text-gray-900 truncate">
                      {credit.customer_name?.trim() || "Customer"}
                    </h3>
                    <p className="text-[11.5px] text-gray-500 mt-0.5 truncate">
                      {BILL_TYPE_LABEL[credit.bill_type] || credit.bill_type}
                      <span className="text-gray-300 mx-1">·</span>
                      {formatDisplayDate(credit.created_at)}
                      {formatDisplayTime(credit.created_at)
                        ? ` · ${formatDisplayTime(credit.created_at)}`
                        : ""}
                    </p>
                    {credit.customer_mobile ? (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {credit.customer_mobile}
                      </p>
                    ) : null}
                    {credit.note ? (
                      <p className="text-[12px] text-gray-600 mt-1">{credit.note}</p>
                    ) : null}
                  </div>
                  <p className="text-[15px] font-bold text-orange-500 shrink-0">
                    {money(credit.amount)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    disabled={previewLoading}
                    onClick={() => handlePreviewBill(credit)}
                    className="press-scale h-9 rounded-lg text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-100 flex items-center justify-center gap-1 disabled:opacity-60"
                  >
                    <Eye size={13} />
                    Bill
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(credit)}
                    className="press-scale h-9 rounded-lg text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 flex items-center justify-center gap-1"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === credit.credit_id}
                    onClick={() => handleDelete(credit)}
                    className="press-scale h-9 rounded-lg text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 flex items-center justify-center gap-1 disabled:opacity-60"
                  >
                    {deletingId === credit.credit_id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>
                        <Trash2 size={12} />
                        Clear
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing ? (
        <div
          className="fixed inset-0 z-[10050] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setEditing(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveEdit}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-4 space-y-3 animate-slide-up"
          >
            <h2 className="text-[16px] font-bold text-gray-900">Edit credit</h2>
            <p className="text-[12px] text-gray-500 -mt-1">
              {editing.customer_name || "Customer"}
            </p>
            <label className="block">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Amount
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="mt-1 w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Note
              </span>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="mt-1 w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="press-scale h-11 rounded-xl text-[13px] font-semibold text-gray-700 bg-gray-50 border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="press-scale h-11 rounded-xl text-[13px] font-semibold text-white bg-orange-500 disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <BillPreviewModal
        open={preview?.type === "standard"}
        order={preview?.type === "standard" ? preview.bill : null}
        onClose={() => setPreview(null)}
      />
      <TiffinBillPreviewModal
        open={preview?.type === "monthly_tiffin"}
        bill={preview?.type === "monthly_tiffin" ? preview.bill : null}
        onClose={() => setPreview(null)}
      />
      <DatewiseBillPreviewModal
        open={preview?.type === "datewise"}
        bill={preview?.type === "datewise" ? preview.bill : null}
        onClose={() => setPreview(null)}
      />
      <CalendarBillPreviewModal
        open={preview?.type === "calendar"}
        bill={preview?.type === "calendar" ? preview.bill : null}
        onClose={() => setPreview(null)}
      />
    </div>
  );
};

export default Credits;
