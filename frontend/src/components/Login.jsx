import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ReactComponent as LogoWh } from "../assets/Logo-wh.svg";
import { ReactComponent as LogoBl } from "../assets/Logo-bl.svg";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const logo = theme === "dark" ? LogoBl : LogoWh;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let data = e.target;

    // Prepare the data to be sent
    // Initialize an empty object for the formatted data
    let formattedData = {
      username: data[0].value,
      password: data[1].value,
    };

    // Prepare data to be sent
    const cleanedFormData = JSON.stringify(formattedData);
    console.log(cleanedFormData);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/token/",
        cleanedFormData,
        {
          headers: {
            "Content-Type": "application/json", // This line is critical
          },
        }
      );
      console.log("API Response:", response.data);
      login(response.data);
      // Redirect to home page upon successful login
      navigate("/");
    } catch (error) {
      console.error("API Error:", error.response);
      // Handle error here (e.g., showing an error message)
    }
  };

  return (
    <section className="bg-slate-100 dark:bg-gray-900 h-full">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-full lg:py-0">
        <a
          href="/"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          {logo === LogoBl ? (
            <LogoWh className="w-64 h-28 mr-2" />
          ) : (
            <LogoBl className="w-64 h-28 mr-2" />
          )}
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Login
            </h1>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 md:space-y-6"
              action="#"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required=""
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required=""
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
