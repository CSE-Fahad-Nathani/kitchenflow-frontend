import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import BottomNavigation from "./components/BottomNavigation";

import Home from "./pages/Home/Home";
import Customers from "./pages/Customers/Customers";
import Dishes from "./pages/Dishes/Dishes";
import BillTypeChooser from "./pages/Orders/BillTypeChooser";
import Orders from "./pages/Orders/Orders";
import MonthlyTiffin from "./pages/MonthlyTiffin/MonthlyTiffin";
import DatewiseBill from "./pages/DatewiseBill/DatewiseBill";
import History from "./pages/History/History";
import SundayMenu from "./pages/SundayMenu/SundayMenu";
import Analysis from "./pages/Analysis/Analysis";
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<BillTypeChooser />} />
          <Route path="/orders/standard" element={<Orders />} />
          <Route path="/orders/monthly-tiffin" element={<MonthlyTiffin />} />
          <Route path="/orders/datewise" element={<DatewiseBill />} />
          <Route path="/history" element={<History />} />

          <Route path="/customers" element={<Customers />} />
          <Route path="/dishes" element={<Dishes />} />
          <Route path="/sunday-menu" element={<SundayMenu />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

        <BottomNavigation />
      </div>
    </BrowserRouter>
  );
}

export default App;