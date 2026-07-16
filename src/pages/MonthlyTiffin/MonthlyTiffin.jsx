import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarPlus, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createMonthlyTiffinBill,
  deleteMonthlyTiffinBill,
  fetchMonthlyTiffinBillById,
  fetchMonthlyTiffinBills,
} from "../../api/monthlyTiffinApi";
import { addCustomer } from "../../api/customerApi";
import CreateMonthlyTiffinView from "../../components/monthlyTiffin/CreateMonthlyTiffinView";
import MonthlyTiffinHistoryView from "../../components/monthlyTiffin/MonthlyTiffinHistoryView";
import MonthlyTiffinDetailView from "../../components/monthlyTiffin/MonthlyTiffinDetailView";
import TiffinBillPreviewModal from "../../components/monthlyTiffin/TiffinBillPreviewModal";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToastStore } from "../../store/toastStore";
import { calcTiffinBill, monthRangeInputValues } from "../../utils/tiffinCalc";

const newLocalId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emptyExcluded = () => ({
  localId: newLocalId(),
  excluded_date: "",
  reason: "",
});

const initialForm = () => {
  const range = monthRangeInputValues();
  return {
    customer_id: null,
    customer_name: "",
    customer_mobile: "",
    from_date: range.fromDate,
    to_date: range.toDate,
    dish_name: "",
    variant_name: "",
    rate_per_day: "",
    delivery_charge: "",
    discount: "",
    variants: [],
  };
};

const MonthlyTiffin = () => {
  const navigate = useNavigate();
  const toast = useToastStore();

  const [view, setView] = useState("home"); // home | create | history | detail

  const [form, setForm] = useState(initialForm);
  const [excludedDates, setExcludedDates] = useState([]);
  const [saveNewCustomer, setSaveNewCustomer] = useState(true);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [bills, setBills] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBill, setPreviewBill] = useState(null);

  const isNewCustomerCandidate = Boolean(
    form.customer_name.trim() && !form.customer_id
  );

  const calc = useMemo(
    () =>
      calcTiffinBill({
        fromDate: form.from_date,
        toDate: form.to_date,
        ratePerDay: form.rate_per_day,
        deliveryCharge: form.delivery_charge,
        discount: form.discount,
        excludedDates,
      }),
    [form, excludedDates]
  );

  const updateForm = (patch) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if ("customer_id" in patch && patch.customer_id == null) {
        setSaveNewCustomer(true);
      }
      if (patch.customer_id) {
        setSaveNewCustomer(false);
      }
      return next;
    });
  };

  const resetCreateForm = () => {
    setForm(initialForm());
    setExcludedDates([]);
    setSaveNewCustomer(true);
  };

  useEffect(() => {
    if (view !== "history") return;

    const run = async () => {
      try {
        setListLoading(true);
        const data = await fetchMonthlyTiffinBills(debouncedSearch);
        setBills(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed", "Unable to load tiffin bills.");
      } finally {
        setListLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, debouncedSearch]);

  useEffect(() => {
    if (view !== "detail" || !selectedId) return;

    const run = async () => {
      try {
        setDetailLoading(true);
        const data = await fetchMonthlyTiffinBillById(selectedId);
        setDetail(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed", "Unable to load bill.");
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedId]);

  const handleAddCustomerNow = async () => {
    if (!form.customer_name.trim() || addingCustomer) return;

    try {
      setAddingCustomer(true);
      const response = await addCustomer({
        name: form.customer_name.trim(),
        mobile: form.customer_mobile.trim() || "",
        address: "",
        notes: "",
      });
      const created = response.data;
      updateForm({
        customer_id: created.customer_id,
        customer_name: created.name || form.customer_name,
        customer_mobile: created.mobile || form.customer_mobile,
      });
      setSaveNewCustomer(false);
      toast.success(
        "Customer added",
        form.customer_mobile.trim()
          ? "Name and mobile saved."
          : "Customer saved with name only."
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed",
        error?.response?.data?.message || "Unable to add customer."
      );
    } finally {
      setAddingCustomer(false);
    }
  };

  const validateForm = () => {
    if (!form.customer_name.trim()) {
      toast.warning("Missing", "Customer name is required.");
      return false;
    }
    if (!form.from_date || !form.to_date) {
      toast.warning("Missing", "From and To dates are required.");
      return false;
    }
    if (form.to_date < form.from_date) {
      toast.warning("Invalid", "To date must be on or after From date.");
      return false;
    }
    if (!form.dish_name.trim()) {
      toast.warning("Missing", "Dish name is required.");
      return false;
    }
    if (!(Number(form.rate_per_day) > 0)) {
      toast.warning("Missing", "Rate per day must be greater than 0.");
      return false;
    }
    if (calc.billableDays <= 0) {
      toast.warning("Invalid", "Billable days must be at least 1.");
      return false;
    }

    return true;
  };

  const ensureCustomerId = async () => {
    let customerId = form.customer_id;

    if (!customerId && saveNewCustomer && form.customer_name.trim()) {
      const response = await addCustomer({
        name: form.customer_name.trim(),
        mobile: form.customer_mobile.trim() || "",
        address: "",
        notes: "",
      });
      customerId = response.data.customer_id;
      updateForm({ customer_id: customerId });
      setSaveNewCustomer(false);
    }

    return customerId;
  };

  const handlePreviewCreate = async () => {
    if (!validateForm() || submitting) return;

    try {
      setSubmitting(true);

      const customerId = await ensureCustomerId();

      const excludedPayload = excludedDates
        .filter((row) => row.excluded_date)
        .map((row) => ({
          excluded_date: row.excluded_date,
          reason: row.reason.trim() || "",
        }));

      const payload = {
        customer_id: customerId || null,
        customer_name: form.customer_name.trim(),
        customer_mobile: form.customer_mobile.trim() || "",
        from_date: form.from_date,
        to_date: form.to_date,
        dish_name: form.dish_name.trim(),
        variant_name: form.variant_name.trim() || "",
        rate_per_day: Number(form.rate_per_day),
        delivery_charge: Number(form.delivery_charge) || 0,
        discount: Number(form.discount) || 0,
        total_amount: calc.grandTotal,
        excluded_dates: excludedPayload,
      };

      const response = await createMonthlyTiffinBill(payload);
      const billId = response?.data?.bill_id;

      const preview = {
        ...payload,
        bill_id: billId,
        excluded_dates: excludedPayload,
      };

      setPreviewBill(preview);
      setPreviewOpen(true);
      toast.success("Created", "Monthly tiffin bill saved.");
      resetCreateForm();
      setView("home");
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed",
        error?.response?.data?.message || "Unable to create bill."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!detail?.bill_id || deleting) return;

    toast.confirm({
      title: "Delete bill?",
      message: "This monthly tiffin bill will be removed permanently.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setDeleting(true);
          await deleteMonthlyTiffinBill(detail.bill_id);
          toast.success("Deleted", "Monthly tiffin bill removed.");
          setDetail(null);
          setSelectedId(null);
          setView("history");
        } catch (error) {
          console.error(error);
          toast.error(
            "Failed",
            error?.response?.data?.message || "Unable to delete bill."
          );
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const headerMeta = (() => {
    if (view === "create") {
      return {
        title: "Create Tiffin Bill",
        subtitle: "Monthly subscription",
        back: () => setView("home"),
      };
    }
    if (view === "history") {
      return {
        title: "Tiffin History",
        subtitle: "Search past bills",
        back: () => setView("home"),
      };
    }
    if (view === "detail") {
      return {
        title: "Tiffin Bill",
        subtitle: detail?.customer_name || "Details",
        back: () => {
          setSelectedId(null);
          setDetail(null);
          setView("history");
        },
      };
    }
    return {
      title: "Monthly Tiffin",
      subtitle: "Daily tiffin billing",
      back: () => navigate("/orders"),
    };
  })();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <header className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-safe pb-5 rounded-b-[1.5rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-start gap-2.5">
          <button
            type="button"
            onClick={headerMeta.back}
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
              {headerMeta.title}
            </h1>
            <p className="text-orange-100/90 text-[12px] mt-0.5 truncate">
              {headerMeta.subtitle}
            </p>
          </div>
        </div>
      </header>

      {view === "home" && (
        <div className="px-3.5 py-4 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              resetCreateForm();
              setView("create");
            }}
            className="press-scale w-full text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] active:border-orange-200"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center mb-3">
              <CalendarPlus size={22} />
            </div>
            <p className="text-[15px] font-bold text-gray-900">
              Create Monthly Tiffin Bill
            </p>
            <p className="text-[12.5px] text-gray-500 mt-1">
              Set date range, dish rate, and excluded days
            </p>
          </button>

          <button
            type="button"
            onClick={() => setView("history")}
            className="press-scale w-full text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] active:border-orange-200"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center mb-3">
              <History size={22} />
            </div>
            <p className="text-[15px] font-bold text-gray-900">History</p>
            <p className="text-[12.5px] text-gray-500 mt-1">
              Search and open past tiffin bills
            </p>
          </button>
        </div>
      )}

      {view === "create" && (
        <CreateMonthlyTiffinView
          form={form}
          onFormChange={updateForm}
          excludedDates={excludedDates}
          onAddExcluded={() =>
            setExcludedDates((prev) => [...prev, emptyExcluded()])
          }
          onUpdateExcluded={(index, patch) =>
            setExcludedDates((prev) =>
              prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
            )
          }
          onRemoveExcluded={(index) =>
            setExcludedDates((prev) => prev.filter((_, i) => i !== index))
          }
          calc={calc}
          isNewCustomerCandidate={isNewCustomerCandidate}
          saveNewCustomer={saveNewCustomer}
          setSaveNewCustomer={setSaveNewCustomer}
          addingCustomer={addingCustomer}
          onAddCustomerNow={handleAddCustomerNow}
          submitting={submitting}
          onPreview={handlePreviewCreate}
        />
      )}

      {view === "history" && (
        <MonthlyTiffinHistoryView
          search={search}
          onSearchChange={setSearch}
          bills={bills}
          loading={listLoading}
          onSelect={(billId) => {
            setSelectedId(billId);
            setView("detail");
          }}
        />
      )}

      {view === "detail" && (
        <MonthlyTiffinDetailView
          loading={detailLoading}
          bill={detail}
          deleting={deleting}
          onPreview={() => {
            setPreviewBill(detail);
            setPreviewOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      <TiffinBillPreviewModal
        open={previewOpen}
        bill={previewBill}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewBill(null);
        }}
      />
    </div>
  );
};

export default MonthlyTiffin;
