import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createCalendarBill,
  deleteCalendarBill,
  fetchCalendarBillById,
  increaseCalendarBillReminder,
  markCalendarBillPaid,
} from "../../api/calendarBillApi";
import { addCustomer } from "../../api/customerApi";
import CreateCalendarBillView from "../../components/calendarBill/CreateCalendarBillView";
import CalendarBillDetailView from "../../components/calendarBill/CalendarBillDetailView";
import CalendarBillPreviewModal from "../../components/calendarBill/CalendarBillPreviewModal";
import { useToastStore } from "../../store/toastStore";
import {
  calcCalendarBill,
  normalizeDates,
} from "../../utils/calendarBillCalc";

const newLocalId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emptyDish = () => ({
  localId: newLocalId(),
  dish_name: "",
  rate_per_day: "",
  quantity: "1",
  delivery_charge_per_day: "",
  dates: [],
});

const initialCustomer = () => ({
  customer_id: null,
  customer_name: "",
  customer_mobile: "",
});

const CalendarBill = () => {
  const navigate = useNavigate();
  const toast = useToastStore();

  const [view, setView] = useState("create");

  const [customer, setCustomer] = useState(initialCustomer);
  const [dishes, setDishes] = useState(() => [emptyDish()]);
  const [showDates, setShowDates] = useState(true);
  const [saveNewCustomer, setSaveNewCustomer] = useState(true);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBill, setPreviewBill] = useState(null);
  const [previewVariant, setPreviewVariant] = useState("bill");

  const isNewCustomerCandidate = Boolean(
    (customer.customer_name || "").trim() && !customer.customer_id
  );

  const calc = useMemo(() => calcCalendarBill(dishes), [dishes]);

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
    setDishes([emptyDish()]);
    setShowDates(true);
    setSaveNewCustomer(true);
  };

  useEffect(() => {
    if (view !== "detail" || !selectedId) return;

    const run = async () => {
      try {
        setDetailLoading(true);
        const data = await fetchCalendarBillById(selectedId);
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

  const handleAddDish = () => {
    setDishes((prev) => [...prev, emptyDish()]);
  };

  const handleUpdateDish = (index, patch) => {
    setDishes((prev) =>
      prev.map((dish, i) => {
        if (i !== index) return dish;
        const next = { ...dish, ...patch };
        if (patch.dates) next.dates = normalizeDates(patch.dates);
        return next;
      })
    );
  };

  const handleRemoveDish = (index) => {
    setDishes((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!(customer.customer_name || "").trim()) {
      toast.warning("Missing", "Customer name is required.");
      return false;
    }
    if (dishes.length === 0) {
      toast.warning("Missing", "Add at least one dish.");
      return false;
    }

    for (let i = 0; i < dishes.length; i++) {
      const dish = dishes[i];
      if (!dish.dish_name?.trim()) {
        toast.warning("Missing", `Enter a name for dish ${i + 1}.`);
        return false;
      }
      if (!(Number(dish.rate_per_day) > 0)) {
        toast.warning("Missing", `Dish ${i + 1} needs a price/day > 0.`);
        return false;
      }
      if (!(Number(dish.quantity) > 0)) {
        toast.warning("Missing", `Dish ${i + 1} needs quantity/day > 0.`);
        return false;
      }
      if (!dish.dates?.length) {
        toast.warning("Missing", `Select dates for dish ${i + 1}.`);
        return false;
      }
    }

    if (calc.grandTotal <= 0) {
      toast.warning("Invalid", "Grand total must be greater than 0.");
      return false;
    }

    return true;
  };

  const ensureCustomerId = async () => {
    let customerId = customer.customer_id;

    if (
      !customerId &&
      saveNewCustomer &&
      (customer.customer_name || "").trim()
    ) {
      const response = await addCustomer({
        name: customer.customer_name.trim(),
        mobile: (customer.customer_mobile || "").trim() || "",
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

      const dishesPayload = dishes.map((dish) => ({
        dish_name: dish.dish_name.trim(),
        rate_per_day: Number(dish.rate_per_day) || 0,
        quantity: Number(dish.quantity) || 1,
        delivery_charge_per_day: Number(dish.delivery_charge_per_day) || 0,
        dates: normalizeDates(dish.dates),
      }));

      const payload = {
        customer_id: customerId || null,
        customer_name: customer.customer_name.trim(),
        customer_mobile: (customer.customer_mobile || "").trim() || "",
        show_dates: Boolean(showDates),
        total_amount: calc.grandTotal,
        dishes: dishesPayload,
      };

      const response = await createCalendarBill(payload);
      const billId = response?.data?.bill_id;

      setPreviewBill({
        ...payload,
        bill_id: billId,
      });
      setPreviewVariant("bill");
      setPreviewOpen(true);
      toast.success("Created", "Calendar bill saved.");
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
    setPreviewBill((prev) =>
      prev?.bill_id === bill_id ? { ...prev, ...patch } : prev
    );
  };

  const handleMarkPaid = () => {
    if (!detail?.bill_id || markingPaid || detail.is_paid) return;

    toast.confirm({
      title: "Mark as Paid?",
      message: "This will mark the calendar bill as paid.",
      confirmLabel: "Mark Paid",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setMarkingPaid(true);
          await markCalendarBillPaid(detail.bill_id);
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
      const response = await increaseCalendarBillReminder(detail.bill_id);
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
      message: "This calendar bill will be removed permanently.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setDeleting(true);
          await deleteCalendarBill(detail.bill_id);
          toast.success("Deleted", "Calendar bill removed.");
          setDetail(null);
          setSelectedId(null);
          setView("create");
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

  const headerMeta =
    view === "detail"
      ? {
          title: "Calendar Bill",
          subtitle: detail?.customer_name || "Details",
          back: () => {
            setSelectedId(null);
            setDetail(null);
            setView("create");
          },
        }
      : {
          title: "Create Calendar Bill",
          subtitle: "Dishes · pick any dates",
          back: () => navigate("/orders"),
        };

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
        <CreateCalendarBillView
          customer={customer}
          onCustomerChange={updateCustomer}
          dishes={dishes}
          onAddDish={handleAddDish}
          onUpdateDish={handleUpdateDish}
          onRemoveDish={handleRemoveDish}
          calc={calc}
          showDates={showDates}
          onShowDatesChange={setShowDates}
          isNewCustomerCandidate={isNewCustomerCandidate}
          saveNewCustomer={saveNewCustomer}
          setSaveNewCustomer={setSaveNewCustomer}
          addingCustomer={addingCustomer}
          onAddCustomerNow={async () => {
            if (!(customer.customer_name || "").trim() || addingCustomer) return;
            try {
              setAddingCustomer(true);
              await ensureCustomerId();
              toast.success("Customer added", "Saved for this bill.");
            } catch (error) {
              console.error(error);
              toast.error(
                "Failed",
                error?.response?.data?.message || "Unable to add customer."
              );
            } finally {
              setAddingCustomer(false);
            }
          }}
          submitting={submitting}
          onPreview={handlePreviewCreate}
        />
      )}

      {view === "detail" && (
        <CalendarBillDetailView
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

      <CalendarBillPreviewModal
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

export default CalendarBill;
