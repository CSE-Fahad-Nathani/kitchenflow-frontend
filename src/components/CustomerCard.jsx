import { Pencil, Trash2 } from "lucide-react";

const CustomerCard = ({ customer, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">

      <div className="flex justify-between items-start">

        <div>

          <h2 className="font-semibold text-lg">
            {customer.name}
          </h2>

          <p className="text-gray-500 mt-1">
            {customer.mobile || "-"}
          </p>

          <p className="text-gray-500">
            {customer.address || "-"}
          </p>

          {customer.notes && (
            <p className="text-sm text-orange-500 mt-2">
              {customer.notes}
            </p>
          )}

        </div>

        <div className="flex gap-2">

          <button
            onClick={() => onEdit(customer)}
            className="p-2 rounded-lg bg-orange-100 text-orange-500"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onDelete(customer)}
            className="p-2 rounded-lg bg-red-100 text-red-500"
          >
            <Trash2 size={18} />
          </button>

        </div>

      </div>

    </div>
  );
};

export default CustomerCard;