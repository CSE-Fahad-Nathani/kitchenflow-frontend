import { useEffect, useRef, useState } from "react";
import { Search, User } from "lucide-react";
import { searchCustomers } from "../api/customerApi";

const CustomerSearch = ({ value, onSelect, onChange }) => {
  const [customers, setCustomers] = useState([]);
  const skipSearchRef = useRef(false);

  useEffect(() => {
    if (!value.trim()) {
      setCustomers([]);
      return;
    }

    // Skip search right after a suggestion was selected
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
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
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Customer name"
        autoComplete="off"
        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 text-[15px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all"
      />

      {customers.length > 0 && (
        <div className="animate-dropdown absolute z-30 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12)] max-h-52 overflow-y-auto scrollbar-none">
          {customers.map((customer) => (
            <button
              key={customer.customer_id}
              type="button"
              onClick={() => {
                skipSearchRef.current = true;
                onSelect(customer);
                setCustomers([]);
              }}
              className="w-full text-left px-3.5 py-3 flex items-center gap-3 active:bg-orange-50 border-b border-gray-50 last:border-0 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-100/80 flex items-center justify-center shrink-0">
                <User size={16} className="text-orange-600" />
              </div>

              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate text-[14px]">
                  {customer.name}
                </div>
                <div className="text-[12.5px] text-gray-500 font-medium">
                  {customer.mobile || "No mobile"}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
