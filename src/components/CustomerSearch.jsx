import { useEffect, useState } from "react";
import { searchCustomers } from "../api/customerApi";

const CustomerSearch = ({ value, onSelect, onChange }) => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (!value.trim()) {
      setCustomers([]);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await searchCustomers(value);
        setCustomers(data);
      } catch (error) {
        console.error(error);
      }
    };

    const timer = setTimeout(fetchData, 300);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search Customer..."
        className="w-full border rounded-xl p-3"
      />

      {customers.length > 0 && (
        <div className="absolute z-20 w-full bg-white border rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">

          {customers.map((customer) => (
            <button
              key={customer.customer_id}
              onClick={() => onSelect(customer)}
              className="w-full text-left p-3 hover:bg-orange-50 border-b last:border-0"
            >
              <div className="font-medium">
                {customer.name}
              </div>

              <div className="text-sm text-gray-500">
                {customer.mobile}
              </div>
            </button>
          ))}

        </div>
      )}
    </div>
  );
};

export default CustomerSearch;