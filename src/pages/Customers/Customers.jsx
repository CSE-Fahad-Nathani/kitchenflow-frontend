import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  addCustomer,
  deleteCustomer,
  fetchCustomers,
  searchCustomers,
  updateCustomer,
} from "../../api/customerApi";
import CustomerCard from "../../components/CustomerCard";
import CustomerModal from "../../components/CustomerModal";
import { useToastStore } from "../../store/toastStore";
import { CustomerRowSkeleton } from "../../components/Skeleton";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const Customers = () => {
  const toast = useToastStore();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const loadCustomers = async () => {
    try {
      setListLoading(true);
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to load customers.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setListLoading(true);

        if (!debouncedSearch.trim()) {
          const data = await fetchCustomers();
          setCustomers(data);
          return;
        }

        const data = await searchCustomers(debouncedSearch);
        setCustomers(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed", "Unable to search customers.");
      } finally {
        setListLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSave = async (form) => {
    try {
      setSaving(true);

      if (selectedCustomer) {
        await updateCustomer({
          customer_id: selectedCustomer.customer_id,
          ...form,
        });
        toast.success("Updated", "Customer updated successfully.");
      } else {
        await addCustomer(form);
        toast.success("Added", "Customer added successfully.");
      }

      setOpenModal(false);
      setSelectedCustomer(null);
      setSearch("");
      await loadCustomers();
    } catch (error) {
      console.error(error);
      toast.error("Failed", "Unable to save customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (customer) => {
    toast.confirm({
      title: "Delete Customer?",
      message: `Delete ${customer.name}? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await deleteCustomer(customer.customer_id);
          setCustomers((prev) =>
            prev.filter((c) => c.customer_id !== customer.customer_id)
          );
          toast.success("Deleted", "Customer deleted successfully.");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to delete customer.");
        }
      },
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <header className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-safe pb-5 rounded-b-[1.5rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <p className="relative text-orange-100 text-[10px] font-semibold tracking-[0.12em] uppercase">
          Arefa's Kitchen
        </p>
        <h1 className="relative text-[1.35rem] font-bold text-white leading-tight mt-0.5 tracking-tight">
          Customers
        </h1>
      </header>

      <div className="px-3.5 py-3 space-y-2.5">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            placeholder="Search customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-white border border-gray-200 rounded-xl pl-9 pr-3 text-[13px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedCustomer(null);
            setOpenModal(true);
          }}
          className="press-scale w-full h-9 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl text-[13px] font-semibold flex justify-center items-center gap-1.5 shadow-md shadow-orange-500/20"
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Customer
        </button>

        {listLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <CustomerRowSkeleton key={i} />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center">
            <p className="font-semibold text-[13.5px] text-gray-800">
              No customers found
            </p>
            <p className="text-[12px] text-gray-500 mt-1">
              {search.trim()
                ? "Try a different search"
                : "Add your first customer"}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.customer_id}
                customer={customer}
                onEdit={(c) => {
                  setSelectedCustomer(c);
                  setOpenModal(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <CustomerModal
        open={openModal}
        customer={selectedCustomer}
        loading={saving}
        onClose={() => {
          setOpenModal(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default Customers;
