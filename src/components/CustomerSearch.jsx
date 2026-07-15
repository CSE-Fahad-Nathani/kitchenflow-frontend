import { useEffect, useRef, useState } from "react";
import { Loader2, Search, User } from "lucide-react";
import { searchCustomers } from "../api/customerApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const CustomerSearch = ({ value, onSelect, onChange }) => {
  const [customers, setCustomers] = useState([]);
  const [searching, setSearching] = useState(false);
  const lastSelectedRef = useRef("");
  const requestIdRef = useRef(0);

  const debouncedValue = useDebouncedValue(value, 350);

  useEffect(() => {
    if (!debouncedValue.trim()) {
      setCustomers([]);
      setSearching(false);
      return;
    }

    if (debouncedValue === lastSelectedRef.current) {
      setCustomers([]);
      setSearching(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setSearching(true);

    const fetchData = async () => {
      try {
        const data = await searchCustomers(debouncedValue);
        if (requestId !== requestIdRef.current) return;
        setCustomers(data);
      } catch (error) {
        console.error(error);
        if (requestId !== requestIdRef.current) return;
        setCustomers([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setSearching(false);
        }
      }
    };

    fetchData();
  }, [debouncedValue]);

  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
      />

      <input
        value={value}
        onChange={(e) => {
          lastSelectedRef.current = "";
          onChange(e.target.value);
        }}
        placeholder="Customer name (optional)"
        autoComplete="off"
        className="w-full h-9 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
      />

      {searching && (
        <Loader2
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 animate-spin"
        />
      )}

      {customers.length > 0 && !searching && (
        <div className="animate-dropdown absolute z-30 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12)] max-h-44 overflow-y-auto scrollbar-none">
          {customers.map((customer) => (
            <button
              key={customer.customer_id}
              type="button"
              onClick={() => {
                lastSelectedRef.current = customer.name;
                onSelect(customer);
                setCustomers([]);
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2.5 active:bg-orange-50 border-b border-gray-50 last:border-0 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <User size={13} className="text-orange-600" />
              </div>

              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate text-[13px]">
                  {customer.name}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
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
