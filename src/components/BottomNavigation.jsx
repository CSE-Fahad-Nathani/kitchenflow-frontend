import {
    House,
    ShoppingCart,
    History,
    Ellipsis,
  } from "lucide-react";
  import { NavLink } from "react-router-dom";
  
  const menus = [
    {
      label: "Home",
      path: "/home",
      icon: House,
    },
    {
      label: "Orders",
      path: "/orders",
      icon: ShoppingCart,
    },
    {
      label: "History",
      path: "/history",
      icon: History,
    },
    {
      label: "More",
      path: "/settings",
      icon: Ellipsis,
    },
  ];
  
  const BottomNavigation = () => {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {menus.map((menu) => {
            const Icon = menu.icon;
  
            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive ? "text-orange-500" : "text-gray-500"
                  }`
                }
              >
                <Icon size={22} strokeWidth={2.2} />
                <span className="mt-1 text-[11px] font-medium">
                  {menu.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };
  
  export default BottomNavigation;