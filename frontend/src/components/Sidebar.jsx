import { ChevronFirst, ChevronLast, MoreVertical } from "lucide-react";
import logo from "../assets/Logo-wh.svg";
import profile from "../assets/Profile.svg";
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="flex h-full">
      <aside className="h-screen sticky top-16">
        <nav className="h-full flex flex-col bg-white border-r shadow dark:border-r dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4 pb-2 flex justify-between items-center">
            <div
              className={`overflow-hidden transition-all ${
                expanded ? "w-32" : "w-0"
              }`}
            >
              {/* <h3>Hey Derma!</h3> */}
            </div>
            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-50"
            >
              {expanded ? <ChevronFirst /> : <ChevronLast />}
            </button>
          </div>

          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 px-3">{children}</ul>
          </SidebarContext.Provider>
        </nav>
      </aside>
    </div>
  );
}

export function SidebarItem({ icon, text, active, alert }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <li
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
        active
          ? "bg-gradient-to-tr from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-gray-50"
          : "hover:bg-blue-200 dark:hover:bg-blue-400 text-gray-800 dark:text-gray-50"
      }`}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-blue-400 ${
            expanded ? "" : "top-2"
          }`}
        ></div>
      )}

      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-blue-200 text-gray-800 dark:bg-blue-400 dark:text-gray-50 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </div>
      )}
    </li>
  );
}

