import { Pencil, Trash2 } from "lucide-react";

const CustomerCard = ({ customer, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-2.5">
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-[13.5px] text-gray-900 truncate leading-tight">
          {customer.name}
        </h2>
        <p className="text-[11.5px] text-gray-500 mt-0.5 truncate">
          {customer.mobile || "No mobile"}
          {customer.address ? ` · ${customer.address}` : ""}
        </p>
        {customer.notes && (
          <p className="text-[11px] text-orange-500 mt-0.5 truncate">
            {customer.notes}
          </p>
        )}
      </div>

      <div className="flex gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(customer)}
          aria-label="Edit customer"
          className="press-scale w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center active:bg-orange-100"
        >
          <Pencil size={14} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(customer)}
          aria-label="Delete customer"
          className="press-scale w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center active:bg-rose-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default CustomerCard;
