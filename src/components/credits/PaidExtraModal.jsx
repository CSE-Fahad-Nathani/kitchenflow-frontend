import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";

/**
 * Prompt for Paid Extra: amount + optional note.
 * onConfirm({ amount, note })
 */
const PaidExtraModal = ({
  open,
  customerName = "",
  billTotal,
  submitting = false,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setNote("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!(value > 0) || submitting) return;
    onConfirm?.({ amount: value, note: note.trim() });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[11000] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden animate-slide-up"
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">Paid Extra</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Marks bill paid and saves credit
              {customerName ? ` · ${customerName}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="press-scale w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {billTotal != null && (
            <p className="text-[12px] text-gray-500">
              Bill total:{" "}
              <span className="font-semibold text-gray-800">
                ₹{Number(billTotal).toLocaleString("en-IN")}
              </span>
            </p>
          )}

          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Extra amount *
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 20"
              className="mt-1 w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-semibold outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Note (optional)
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="No change, paid with 500…"
              className="mt-1 w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="press-scale h-11 rounded-xl text-[13px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !(Number(amount) > 0)}
              className="press-scale h-11 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Credit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PaidExtraModal;
