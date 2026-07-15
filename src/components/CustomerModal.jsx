import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

const initialState = {
  name: "",
  mobile: "",
  address: "",
  notes: "",
};

const fieldClass =
  "w-full h-9 bg-gray-50 border border-gray-200 rounded-xl px-3 text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all";

const CustomerModal = ({
  open,
  onClose,
  onSave,
  loading = false,
  customer = null,
}) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        mobile: customer.mobile || "",
        address: customer.address || "",
        notes: customer.notes || "",
      });
    } else {
      setForm(initialState);
    }
  }, [customer, open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px] flex items-end"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[85dvh] overflow-hidden animate-slide-up shadow-[0_-8px_40px_rgba(0,0,0,0.15)] flex flex-col"
      >
        <div className="shrink-0 px-4 pt-2.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

          <div className="flex justify-between items-center gap-3">
            <div>
              <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-[0.12em]">
                Customers
              </p>
              <h2 className="text-[15px] font-bold text-gray-900 mt-0.5">
                {customer ? "Edit Customer" : "Add Customer"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="press-scale w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 active:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-3.5 py-3 space-y-2.5">
          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Name
            </span>
            <input
              placeholder="Customer name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`${fieldClass} mt-1`}
              autoFocus
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Mobile{" "}
              <span className="normal-case tracking-normal font-medium">
                (optional)
              </span>
            </span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Mobile (optional)"
              value={form.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              className={`${fieldClass} mt-1`}
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Address
            </span>
            <input
              placeholder="Address (optional)"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className={`${fieldClass} mt-1`}
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Notes
            </span>
            <textarea
              placeholder="Notes (optional)"
              rows={2}
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all resize-none"
            />
          </label>
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white p-2.5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="press-scale flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 text-[13px] font-semibold text-gray-700 active:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || !form.name.trim()}
            onClick={handleSubmit}
            className="press-scale flex-1 h-10 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving
              </>
            ) : customer ? (
              "Update"
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
