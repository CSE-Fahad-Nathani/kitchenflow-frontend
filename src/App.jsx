import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import BottomNavigation from "./components/BottomNavigation";

import Home from "./pages/Home/Home";
import Customers from "./pages/Customers/Customers";
import Dishes from "./pages/Dishes/Dishes";
import Orders from "./pages/Orders/Orders";
import History from "./pages/History/History";
import SundayMenu from "./pages/SundayMenu/SundayMenu";
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/history" element={<History />} />

          <Route path="/customers" element={<Customers />} />
          <Route path="/dishes" element={<Dishes />} />
          <Route path="/sunday-menu" element={<SundayMenu />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

        <BottomNavigation />
      </div>
    </BrowserRouter>
  );
}

export default App;