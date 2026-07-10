import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  addDish,
  deleteDish,
  fetchDishes,
  searchDishes,
  updateDish,
} from "../../api/dishApi";
import DishCard from "../../components/DishCard";
import DishModal from "../../components/DishModal";

const Dishes = () => {
  const [dishes, setDishes] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  const loadDishes = async () => {
    try {
      const data = await fetchDishes();
      setDishes(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDishes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (!search.trim()) {
          loadDishes();
          return;
        }

        const data = await searchDishes(search);
        setDishes(data);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSave = async (form) => {
    try {
      setLoading(true);

      const payload = {
        dish_name: form.dish_name,
        category: form.category,
        variants: form.variants.map((variant) => ({
          variant_name: variant.variant_name,
          price: Number(variant.price),
        })),
      };

      if (selectedDish) {
        await updateDish({
          dish_id: selectedDish.dish_id,
          ...payload,
        });
      } else {
        await addDish(payload);
      }

      setOpenModal(false);
      setSelectedDish(null);

      loadDishes();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dish) => {
    if (!window.confirm(`Delete "${dish.dish_name}"?`)) return;

    try {
      await deleteDish(dish.dish_id);
      loadDishes();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">

      <div className="bg-orange-500 px-5 py-5 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-white">
          Dishes
        </h1>
      </div>

      <div className="p-4 space-y-4">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            placeholder="Search Dish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl py-3 pl-10 pr-3"
          />

        </div>

        <button
          onClick={() => {
            setSelectedDish(null);
            setOpenModal(true);
          }}
          className="w-full bg-orange-500 text-white rounded-xl py-3 flex justify-center items-center gap-2"
        >
          <Plus size={18} />
          Add Dish
        </button>

        <div className="space-y-3">

          {dishes.map((dish) => (
            <DishCard
              key={dish.dish_id}
              dish={dish}
              onEdit={(dish) => {
                setSelectedDish(dish);
                setOpenModal(true);
              }}
              onDelete={handleDelete}
            />
          ))}

        </div>

      </div>

      <DishModal
        open={openModal}
        dish={selectedDish}
        loading={loading}
        onClose={() => {
          setOpenModal(false);
          setSelectedDish(null);
        }}
        onSave={handleSave}
      />

    </div>
  );
};

export default Dishes;