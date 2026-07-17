import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createDatewiseBill,
  deleteDatewiseBill,
  fetchDatewiseBillById,
  fetchDatewiseBills,
  increaseDatewiseBillReminder,
  markDatewiseBillPaid,
} from "../../api/datewiseBillApi";
import { addCustomer } from "../../api/customerApi";
import CreateDatewiseBillView from "../../components/datewise/CreateDatewiseBillView";
import DatewiseBillHistoryView from "../../components/datewise/DatewiseBillHistoryView";
import DatewiseBillDetailView from "../../components/datewise/DatewiseBillDetailView";
import DatewiseBillPreviewModal from "../../components/datewise/DatewiseBillPreviewModal";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToastStore } from "../../store/toastStore";
import {
  addDaysToDateInput,
  calcDatewiseBill,
  todayInputValue,
} from "../../utils/datewiseCalc";

const newLocalId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emptyItem = () => ({
  localId: newLocalId(),
  dish_name: "",
  variant_name: "",
  quantity: "1",
  price: "",
  note: "",
  variants: [],
});

const emptyDay = (bill_date = todayInputValue()) => ({
  localId: newLocalId(),
  bill_date,
  delivery_charge: "",
  note: "",
  items: [emptyItem()],
});

const initialCustomer = () => ({
  customer_id: null,
  customer_name: "",
  customer_mobile: "",
  discount: "",
});

const DatewiseBill = () => {
  const navigate = useNavigate();
  const toast = useToastStore();

  const [view, setView] = useState("create"); // create | history | detail

  const [customer, setCustomer] = useState(initialCustomer);
  const [days, setDays] = useState(() => [emptyDay()]);
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
  const [markingPaid, setMarkingPaid] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBill, setPreviewBill] = useState(null);
  const [previewVariant, setPreviewVariant] = useState("bill");

  const isNewCustomerCandidate = Boolean(
    customer.customer_name.trim() && !customer.customer_id
  );

  const calc = useMemo(
    () => calcDatewiseBill(days, customer.discount),
    [days, customer.discount]
  );

  const updateCustomer = (patch) => {
    setCustomer((prev) => {
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
    setCustomer(initialCustomer());
    setDays([emptyDay()]);
    setSaveNewCustomer(true);
  };

  useEffect(() => {
    if (view !== "history") return;

    const run = async () => {
      try {
        setListLoading(true);
        const data = await fetchDatewiseBills(debouncedSearch);
        setBills(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed", "Unable to load date-wise bills.");
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
        const data = await fetchDatewiseBillById(selectedId);
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
    if (!customer.customer_name.trim() || addingCustomer) return;

    try {
      setAddingCustomer(true);
      const response = await addCustomer({
        name: customer.customer_name.trim(),
        mobile: customer.customer_mobile.trim() || "",
        address: "",
        notes: "",
      });
      const created = response.data;
      updateCustomer({
        customer_id: created.customer_id,
        customer_name: created.name || customer.customer_name,
        customer_mobile: created.mobile || customer.customer_mobile,
      });
      setSaveNewCustomer(false);
      toast.success(
        "Customer added",
        customer.customer_mobile.trim()
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

  const handleAddDay = () => {
    setDays((prev) => {
      const lastDate = [...prev].reverse().find((d) => d.bill_date)?.bill_date;
      const nextDate = lastDate
        ? addDaysToDateInput(lastDate, 1)
        : todayInputValue();
      return [...prev, emptyDay(nextDate)];
    });
  };

  const handleUpdateDay = (dayIndex, patch) => {
    setDays((prev) =>
      prev.map((day, i) => (i === dayIndex ? { ...day, ...patch } : day))
    );
  };

  const handleRemoveDay = (dayIndex) => {
    setDays((prev) => prev.filter((_, i) => i !== dayIndex));
  };

  const handleAddItem = (dayIndex) => {
    setDays((prev) =>
      prev.map((day, i) =>
        i === dayIndex ? { ...day, items: [...day.items, emptyItem()] } : day
      )
    );
  };

  const handleUpdateItem = (dayIndex, itemIndex, patch) => {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== dayIndex) return day;
        return {
          ...day,
          items: day.items.map((item, j) =>
            j === itemIndex ? { ...item, ...patch } : item
          ),
        };
      })
    );
  };

  const handleRemoveItem = (dayIndex, itemIndex) => {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== dayIndex) return day;
        return {
          ...day,
          items: day.items.filter((_, j) => j !== itemIndex),
        };
      })
    );
  };

  const validateForm = () => {
    if (!customer.customer_name.trim()) {
      toast.warning("Missing", "Customer name is required.");
      return false;
    }
    if (days.length === 0) {
      toast.warning("Missing", "Add at least one date.");
      return false;
    }

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (!day.bill_date) {
        toast.warning("Missing", `Select a date for card ${i + 1}.`);
        return false;
      }
      const items = day.items || [];
      if (items.length === 0) {
        toast.warning("Missing", `Add at least one item for date ${i + 1}.`);
        return false;
      }
      for (const item of items) {
        if (!item.dish_name?.trim()) {
          toast.warning("Missing", "Every item needs a dish name.");
          return false;
        }
        if (!(Number(item.quantity) > 0)) {
          toast.warning("Missing", "Every item needs a quantity greater than 0.");
          return false;
        }
        if (!(Number(item.price) > 0)) {
          toast.warning("Missing", "Every item needs a rate greater than 0.");
          return false;
        }
      }
    }

    if (calc.grandTotal < 0) {
      toast.warning("Invalid", "Grand total cannot be negative.");
      return false;
    }

    return true;
  };

  const ensureCustomerId = async () => {
    let customerId = customer.customer_id;

    if (!customerId && saveNewCustomer && customer.customer_name.trim()) {
      const response = await addCustomer({
        name: customer.customer_name.trim(),
        mobile: customer.customer_mobile.trim() || "",
        address: "",
        notes: "",
      });
      customerId = response.data.customer_id;
      updateCustomer({ customer_id: customerId });
      setSaveNewCustomer(false);
    }

    return customerId;
  };

  const handlePreviewCreate = async () => {
    if (!validateForm() || submitting) return;

    try {
      setSubmitting(true);

      const customerId = await ensureCustomerId();

      const daysPayload = days.map((day) => ({
        bill_date: day.bill_date,
        delivery_charge: Number(day.delivery_charge) || 0,
        note: day.note?.trim() || "",
        items: (day.items || []).map((item) => ({
          dish_name: item.dish_name.trim(),
          variant_name: item.variant_name?.trim() || "",
          quantity: String(Number(item.quantity) || 1),
          price: Number(item.price) || 0,
          note: item.note?.trim() || "",
        })),
      }));

      const payload = {
        customer_id: customerId || null,
        customer_name: customer.customer_name.trim(),
        customer_mobile: customer.customer_mobile.trim() || "",
        discount: Number(customer.discount) || 0,
        total_amount: calc.grandTotal,
        days: daysPayload,
      };

      const response = await createDatewiseBill(payload);
      const billId = response?.data?.bill_id;

      setPreviewBill({
        ...payload,
        bill_id: billId,
      });
      setPreviewVariant("bill");
      setPreviewOpen(true);
      toast.success("Created", "Date-wise bill saved.");
      resetCreateForm();
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

  const syncBillPayment = (bill_id, patch) => {
    setDetail((prev) =>
      prev?.bill_id === bill_id ? { ...prev, ...patch } : prev
    );
    setBills((prev) =>
      prev.map((bill) =>
        bill.bill_id === bill_id ? { ...bill, ...patch } : bill
      )
    );
    setPreviewBill((prev) =>
      prev?.bill_id === bill_id ? { ...prev, ...patch } : prev
    );
  };

  const handleMarkPaid = () => {
    if (!detail?.bill_id || markingPaid || detail.is_paid) return;

    toast.confirm({
      title: "Mark as Paid?",
      message: "This will mark the date-wise bill as paid.",
      confirmLabel: "Mark Paid",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setMarkingPaid(true);
          await markDatewiseBillPaid(detail.bill_id);
          syncBillPayment(detail.bill_id, { is_paid: true });
          toast.success("Marked Paid", "Payment updated successfully.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to update payment.");
        } finally {
          setMarkingPaid(false);
        }
      },
    });
  };

  const handleReminder = async () => {
    if (!detail?.bill_id) return;

    try {
      const response = await increaseDatewiseBillReminder(detail.bill_id);
      const reminder_count = response.data.reminder_count;
      const updated = { ...detail, reminder_count };
      syncBillPayment(detail.bill_id, { reminder_count });
      setPreviewBill(updated);
      setPreviewVariant("reminder");
      setPreviewOpen(true);
      toast.success(
        "Reminder ready",
        `Reminder #${reminder_count} — download or copy to send.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to update reminder.");
    }
  };

  const handleDelete = () => {
    if (!detail?.bill_id || deleting) return;

    toast.confirm({
      title: "Delete bill?",
      message: "This date-wise bill will be removed permanently.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setDeleting(true);
          await deleteDatewiseBill(detail.bill_id);
          toast.success("Deleted", "Date-wise bill removed.");
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
        title: "Create Date-wise Bill",
        subtitle: "Orders grouped by date",
        back: () => navigate("/orders"),
      };
    }
    if (view === "history") {
      return {
        title: "Date-wise History",
        subtitle: "Search past bills",
        back: () => setView("create"),
      };
    }
    if (view === "detail") {
      return {
        title: "Date-wise Bill",
        subtitle: detail?.customer_name || "Details",
        back: () => {
          setSelectedId(null);
          setDetail(null);
          setView("history");
        },
      };
    }
    return {
      title: "Date-wise Bill",
      subtitle: "Multiple dates, one bill",
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

      {view === "create" && (
        <CreateDatewiseBillView
          customer={customer}
          onCustomerChange={updateCustomer}
          days={days}
          onAddDay={handleAddDay}
          onUpdateDay={handleUpdateDay}
          onRemoveDay={handleRemoveDay}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
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
        <DatewiseBillHistoryView
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
        <DatewiseBillDetailView
          loading={detailLoading}
          bill={detail}
          deleting={deleting}
          markingPaid={markingPaid}
          onPreview={() => {
            setPreviewBill(detail);
            setPreviewVariant("bill");
            setPreviewOpen(true);
          }}
          onMarkPaid={handleMarkPaid}
          onReminder={handleReminder}
          onDelete={handleDelete}
        />
      )}

      <DatewiseBillPreviewModal
        open={previewOpen}
        bill={previewBill}
        variant={previewVariant}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewBill(null);
          setPreviewVariant("bill");
        }}
      />
    </div>
  );
};

export default DatewiseBill;
