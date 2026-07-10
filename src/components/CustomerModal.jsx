import { useEffect, useState } from "react";

const initialState = {
  name: "",
  mobile: "",
  address: "",
  notes: "",
};

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
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end">

<div className="bg-white w-full rounded-t-3xl p-5 pb-28 space-y-4 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold">
          {customer ? "Edit Customer" : "Add Customer"}
        </h2>

        <input
          placeholder="Customer Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={(e) => handleChange("mobile", e.target.value)}
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="w-full border rounded-xl p-3"
        />

        <textarea
          placeholder="Notes"
          rows={3}
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className="w-full border rounded-xl p-3 resize-none"
        />

        <div className="flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-3"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-orange-500 text-white rounded-xl py-3 disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : customer
              ? "Update"
              : "Save"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default CustomerModal;