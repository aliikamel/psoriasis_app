import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Home,
  StickyNote,
  Layers,
  Flag,
  Calendar,
  LifeBuoy,
  Settings,
  X,
  Check,
  UsersRound,
  BrainCircuit,
  Ellipsis,
  Upload,
} from "lucide-react";
import Sidebar, { SidebarItem } from "../Sidebar";
import axios from "axios";
import profile from "../../assets/Profile.svg";
import { Link } from "react-router-dom";

function Patients() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [managedPatients, setManagedPatients] = useState([]);
  const [chosenUser, setChosenUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/users`
        );
        console.log("API Response:", response.data);
        setAllUsers(response.data);
        setSearchResults(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching data. Please try again.");
        setLoading(false);
      }
    };
    getAllUsers();

    const getManagedPatients = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/get-patients-managed?dermatologist_id=${localStorage.getItem(
            "userId"
          )}`
        );
        console.log("API Response:", response.data);
        setManagedPatients(response.data);
      } catch (error) {
        setError("Error fetching data. Please try again.");
      }
    };
    getManagedPatients();
  }, []);

  const handleSearch = (e) => {
    setChosenUser({});
    console.log(loading);
    const query = e.target.value;
    setSearchQuery(query);
    console.log("ALL USERS: ", allUsers);
    const filteredResults = allUsers.filter((result) => {
      //   console.log("Query ", query);
      //   console.log(result.username.includes(query));
      let fullName = `${result.first_name} ${result.last_name}`;
      return (
        result.username.toLowerCase().includes(query.toLowerCase()) ||
        fullName.toLowerCase().includes(query.toLowerCase())
      );
    });
    console.log("Current Filter: ", filteredResults);
    setSearchResults(filteredResults);
  };

  const handleSearchFocus = () => {
    setDropdownVisible(true);
  };

  const handleSearchBlur = () => {
    // Wait a bit before hiding dropdown to allow for item click to be registered
    setTimeout(() => setDropdownVisible(false), 150);
  };

  const handlePatientChosen = (e) => {
    let input = document.getElementById("patient-search");
    setChosenUser(e);
    input.value = e.username;
    console.log(e);
  };

  const toggleModal = () => {
    let modal = document.getElementById("defaultModal");
    modal.hidden ? (modal.hidden = false) : (modal.hidden = true);
  };

  const toggleDropdown = (dropdown_id) => {
    let dropdown = document.getElementById(dropdown_id);
    return dropdown.hidden
      ? (dropdown.hidden = false)
      : (dropdown.hidden = true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formattedData = {
      patient_id: `${chosenUser.id}`,
      dermatologist_id: `${localStorage.getItem("userId")}`,
    };

    const cleanedFormData = JSON.stringify(formattedData);

    console.log(cleanedFormData);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/users/add-patient/`,
        cleanedFormData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API Response:", response.data);
    } catch (error) {
      console.log("API Response:", error);
      setError("Error fetching data. Please try again.");
    }
  };

  return (
    <div className="flex h-mx">
      <Sidebar className="">
        <a href="/">
          <SidebarItem icon={<Home size={20} />} text="Home" />
        </a>
        <a href="/dashboard">
          <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" />
        </a>
        <a href="/patients">
          <SidebarItem icon={<UsersRound size={20} />} text="Patients" active />
        </a>
        <a href="simulate-model">
          <SidebarItem
            icon={<BrainCircuit size={20} />}
            text="Model Simulation"
          />
        </a>
        <a href="upload">
          <SidebarItem icon={<Upload />} text="Upload & Run" />
        </a>

        <SidebarItem icon={<Calendar size={20} />} text="Calendar" />
        <SidebarItem icon={<Layers size={20} />} text="Tasks" />

        {/* <hr className="my-3" />
        <SidebarItem icon={<Settings size={20} />} text="Settings" />
        <SidebarItem icon={<LifeBuoy size={20} />} text="Help" /> */}
      </Sidebar>

      <div className="w-full h-full p-4 h-auto pt-8">
        <div className="flex justify-center m-5">
          <button
            id="defaultModalButton"
            className="block text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
            onClick={toggleModal}
          >
            Add Patient
          </button>
        </div>
        {/* <!-- Main modal --> */}
        <div
          hidden
          id="defaultModal"
          tabIndex="-1"
          aria-hidden="true"
          className="backdrop-blur-sm overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
        >
          <div className="relative p-4 w-full max-w-2xl h-full m-auto">
            {/* <!-- Modal content --> */}
            <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
              {/* <!-- Modal header --> */}
              <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Patient
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="defaultModal"
                  onClick={toggleModal}
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* <!-- Modal body --> */}
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 mb-4 sm:grid-cols-2">
                  <div className="relative sm:col-span-2">
                    <label
                      htmlFor="search"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Search *
                    </label>
                    <div>
                      <input
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        type="text"
                        value={
                          Object.keys(chosenUser).length
                            ? chosenUser.username
                            : searchQuery
                        }
                        onChange={handleSearch}
                        name="patient-search"
                        id="patient-search"
                        className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder={"Find Patient"}
                      />
                      <div className="absolute end-2.5 bottom-2.5">
                        {Object.keys(chosenUser).length ? (
                          <Check
                            size={24}
                            color="#00ff4c"
                            strokeWidth={3}
                            absoluteStrokeWidth
                          />
                        ) : (
                          <X
                            size={24}
                            color="#ff0019"
                            strokeWidth={3}
                            absoluteStrokeWidth
                          />
                        )}
                      </div>
                    </div>

                    {!dropdownVisible || (
                      <div className="absolute z-10 mt-1 w-full bg-gray-50 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-gray-900">
                        <ul>
                          {searchResults.map((result) => (
                            <li
                              key={`${result.username}`}
                              onClick={() => handlePatientChosen(result)}
                              className="p-2 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-50 text-sm font-medium font-sans border-b dark:border-gray-800"
                            >
                              <p>{`${result.first_name} ${result.last_name}`}</p>
                              <p className="font-normal text-gray-400 dark:text-gray-400">
                                {result.username}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {error && <p>{error}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="description"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Medical History/Notes
                    </label>
                    <textarea
                      id="description"
                      rows="4"
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Write patient medical history here"
                    ></textarea>
                  </div>
                </div>
                <button
                  disabled={Object.keys(chosenUser).length ? false : true}
                  type="submit"
                  className={`inline-flex items-center font-medium rounded-lg text-sm px-5 py-2.5 text-center
                    ${
                      Object.keys(chosenUser).length
                        ? "bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300"
                        : "bg-gray-400 dark:bg-gray-400 cursor-not-allowed"
                    } text-white focus:outline-none focus:ring-4 dark:focus:ring-blue-800`}
                >
                  <svg
                    className="mr-1 -ml-1 w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Add Patient
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          {managedPatients.map((patient, index) => (
            <div
              key={`${index}_card`}
              className="border-2 bg-white dark:bg-gray-800 rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"
            >
              <div
                className="flex relative justify-end px-4 pt-4"
                onBlur={() =>
                  setTimeout(toggleDropdown, 50, `dropdown-${index}`)
                }
              >
                <button
                  id="dropdownButton"
                  data-dropdown-toggle={`dropdown-${index}`}
                  className="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
                  type="button"
                  onClick={() => toggleDropdown(`dropdown-${index}`)}
                >
                  <Ellipsis
                    color="#6b7280"
                    strokeWidth={3}
                    absoluteStrokeWidth
                    size={24}
                  />
                </button>
                {/* <!-- Dropdown menu --> */}
                <div
                  hidden
                  onBlur={() => toggleDropdown(`dropdown-${index}`)}
                  id={`dropdown-${index}`}
                  className="absolute top-12 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
                >
                  <ul className="py-2" aria-labelledby="dropdownButton">
                    <li>
                      <a
                        href="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Edit
                      </a>
                    </li>
                    <li>
                      <a
                        href="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Export Data
                      </a>
                    </li>
                    <li>
                      <a
                        href="/"
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <Link to={`/patients/${patient.id}/`}>
                <div className="flex flex-col items-center pb-10">
                  <img
                    className="w-24 h-24 mb-3 rounded-full shadow-lg"
                    src={profile}
                    alt="profile-pic"
                  />
                  <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                    {`${patient.first_name} ${patient.last_name}`}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {patient.username}
                  </p>
                  <div className="flex mt-4 md:mt-6">
                    <a
                      href="/"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Open Patient
                    </a>
                    <a
                      href="/"
                      className="py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                      Message
                    </a>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-96 mb-4"></div>
      </div>
    </div>
  );
}

export default Patients;
