import React from "react";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { isAuthenticated, role } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-9xl text-center font-bold leading-tight tracking-tight text-blue-700">
        Hello
      </h1>
      <h1 className="text-6xl text-center font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
        {isAuthenticated &&
          role === "dermatologist" &&
          `${localStorage.getItem("firstName")} ${localStorage.getItem("lastName")}`}
        {isAuthenticated &&
          role === "patient" &&
          localStorage.getItem("firstName")}
      </h1>
    </div>
  );
}

export default Home;
