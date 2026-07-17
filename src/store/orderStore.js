import { create } from "zustand";
import { toLocalDateInputValue } from "../utils/formatDate";



const getDefaultDeliveryTime = () => {
  const now = new Date();

  let hour = now.getHours();
  let minute = now.getMinutes();

  if (minute <= 30) {
    minute = 30;
  } else {
    minute = 0;
    hour++;

    if (hour === 24) {
      hour = 0;
    }
  }

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};



const calculateGrandTotal = (state) => {
  const itemsTotal = state.items.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  return (
    itemsTotal +
    Number(state.deliveryCharge || 0) -
    Number(state.discount || 0)
  );
};

const useOrderStore = create((set) => ({
  customer: "",
  customer_id: null,
  mobile: "",

  deliveryDate: toLocalDateInputValue(),
  deliveryTime: getDefaultDeliveryTime(),
  
  deliveryCharge: 0,
  discount: 0,

  items: [],

  grandTotal: 0,

  isEditing: false,
  editingOrderId: null,

  setCustomer: (customer) =>
    set((state) => ({
      ...state,
      customer,
    })),

  setCustomerId: (customer_id) =>
    set((state) => ({
      ...state,
      customer_id,
    })),

    setMobile: (mobile) =>
      set((state) => ({
        ...state,
        mobile,
      })),
    
    setDeliveryDate: (deliveryDate) =>
      set((state) => ({
        ...state,
        deliveryDate,
      })),
    
    setDeliveryTime: (deliveryTime) =>
      set((state) => ({
        ...state,
        deliveryTime,
      })),

  setCharges: (field, value) =>
    set((state) => {
      const newState = {
        ...state,
        [field]: Number(value || 0),
      };

      return {
        ...newState,
        grandTotal: calculateGrandTotal(newState),
      };
    }),

  addItem: () =>
    set((state) => {
      const newState = {
        ...state,
        items: [
          ...state.items,
          {
            dish_id: null,
            variant_id: null,

            dish_name: "",
            variant_name: "",

            quantity: 1,
            unit_price: 0,
            total: 0,

            variants: [],
            saveNewDish: true,
          },
        ],
      };

      return {
        ...newState,
        grandTotal: calculateGrandTotal(newState),
      };
    }),

    setItems: (items) =>
      set((state) => {
        const newState = {
          ...state,
          items,
        };
    
        return {
          ...newState,
          grandTotal: calculateGrandTotal(newState),
        };
      }),
    
    loadOrder: (order) =>
      set({
        isEditing: true,
        editingOrderId: order.order_id,
    
        customer: order.customer_name,
        customer_id: order.customer_id,
        mobile: order.customer_mobile,

        deliveryDate: order.delivery_datetime.split("T")[0],
        deliveryTime: order.delivery_datetime.slice(11,16),

        deliveryCharge: Number(order.delivery_charge),
        discount: Number(order.discount),
    
        items: order.items.map((item) => ({
          dish_id: item.dish_id,
          variant_id: item.variant_id,
          dish_name: item.dish_name,
          variant_name: item.variant_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total_price,
          variants: [],
          saveNewDish: false,
        })),
    
        grandTotal: Number(order.total_amount),
      }),
    
    resetOrder: () =>
    set({
      customer: "",
      customer_id: null,
      mobile: "",

      deliveryDate: toLocalDateInputValue(),
      deliveryTime: getDefaultDeliveryTime(),

      deliveryCharge: 0,
      discount: 0,

      items: [],

      grandTotal: 0,

      isEditing: false,
      editingOrderId: null,
    }),
}));




export default useOrderStore;