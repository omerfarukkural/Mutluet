import { Home, Calendar, Heart, User } from "lucide-react";
import { Link, useLocation } from "react-router";

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/events", icon: Calendar, label: "Events" },
    { path: "/donate", icon: Heart, label: "Donate" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 max-w-[375px] mx-auto">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 flex-1"
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? "text-gray-900" : "text-gray-400"
                }`}
              />
              <span
                className={`text-xs ${
                  isActive ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
