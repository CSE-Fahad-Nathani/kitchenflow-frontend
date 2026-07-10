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

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (!search.trim()) {
          loadCustomers();
          return;
        }

        const data = await searchCustomers(search);
        setCustomers(data);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSave = async (form) => {
    try {
      setLoading(true);

      if (selectedCustomer) {
        await updateCustomer({
          customer_id: selectedCustomer.customer_id,
          ...form,
        });
      } else {
        await addCustomer(form);
      }

      setOpenModal(false);
      setSelectedCustomer(null);

      loadCustomers();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete ${customer.name}?`)) return;

    try {
      await deleteCustomer(customer.customer_id);
      loadCustomers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">

      <div className="bg-orange-500 px-5 py-5 rounded-b-3xl">

        <h1 className="text-2xl font-bold text-white">
          Customers
        </h1>

      </div>

      <div className="p-4 space-y-4">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            placeholder="Search Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl py-3 pl-10 pr-3"
          />

        </div>

        <button
          onClick={() => {
            setSelectedCustomer(null);
            setOpenModal(true);
          }}
          className="w-full bg-orange-500 text-white rounded-xl py-3 flex justify-center items-center gap-2"
        >
          <Plus size={18} />
          Add Customer
        </button>

        <div className="space-y-3">

          {customers.map((customer) => (
            <CustomerCard
              key={customer.customer_id}
              customer={customer}
              onEdit={(customer) => {
                setSelectedCustomer(customer);
                setOpenModal(true);
              }}
              onDelete={handleDelete}
            />
          ))}

        </div>

      </div>

      <CustomerModal
        open={openModal}
        customer={selectedCustomer}
        loading={loading}
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