import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar";
import { SidebarItem } from "../Sidebar";
import {
  LayoutDashboard,
  Home,
  Layers,
  Calendar,
  UsersRound,
  BrainCircuit,
  Pencil,
  CirclePlus,
  X,
  Save,
} from "lucide-react";
import profile from "../../assets/Profile.svg";
import Datepicker from "tailwind-datepicker-react";

function PatientDetails() {
  const { patientId } = useParams();
  const [patientDetails, setPatientDetails] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [editingTable, setEditingTable] = useState(false);
  const [editableSessions, setEditableSessions] = useState({});

  const dateOptions = {
    inputPlaceholderProp: "Select Start Date",
  };

  const handleDateClose = (state) => {
    setShowDate(state);
  };

  const toggleEditMode = () => {
    if (editingTable) {
      setEditingTable(false);
      setEditableSessions({});
    } else {
      setEditingTable(true);
    }
  };

  // Update editableSessions state upon input change
  const handleSessionChange = (sessionKey, newValue) => {
    setEditableSessions((prevState) => ({
      ...prevState,
      [sessionKey]: newValue,
    }));
  };

  const handleSaveSessionChanges = () => {
    setEditingTable(false);

    // Clone the current treatmentPlan to avoid direct state mutation
    let updatedTreatmentPlan = JSON.parse(JSON.stringify(treatmentPlan));

    Object.keys(editableSessions).forEach((sessionKey) => {
      updatedTreatmentPlan.WEEKS.forEach((week, weekIndex) => {
        if (sessionKey in week) {
          // Update the actual dose for the session
          updatedTreatmentPlan.WEEKS[weekIndex][sessionKey].planned_dose =
            editableSessions[sessionKey];
        }
      });
    });

    // Now set the updated treatment plan in the state and clear editableSessions
    setEditingTable(false);
    setEditableSessions({});
    setTreatmentPlan(updatedTreatmentPlan);
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/get-patient-details/?patient_id=${patientId}`
        );
        setPatientDetails(response.data);
        setTreatmentPlan(response.data.treatment.treatment_plan);
        setIsLoading(false);
        console.log(response.data);
      } catch (err) {
        setError("Failed to fetch patient details.");
        setIsLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const toggleModal = () => {
    let modal = document.getElementById("defaultModal");
    modal.hidden ? (modal.hidden = false) : (modal.hidden = true);
  };

  const handleStartTreatment = async (e) => {
    e.preventDefault();
    console.log(e);
    let data = e.target;
    let formattedData = {
      patient_profile_id: `${patientDetails.user.patient_profile}`,
      start_date: data[0].value,
      weekly_sessions: data[1].value,
      num_of_weeks: data[2].value,
      med: data[3].value,
      pasi_pre_treatment: data[4].value,
    };

    const cleanedFormData = JSON.stringify(formattedData);

    console.log(cleanedFormData);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/users/create-patient-treatment/`,
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

        <SidebarItem icon={<Calendar size={20} />} text="Calendar" />
        <SidebarItem icon={<Layers size={20} />} text="Tasks" />
      </Sidebar>
      <div className="w-full h-full p-4 pt-8">
        <div className="grid grid-cols-3 gap-4 mb-4 h-auto md:h-full">
          {/* LEFT SIDE 2/3 */}
          <div className="col-span-2">
            <div className="p-6 border-2 bg-white dark:bg-gray-800 gap-2 flex flex-col justify-center rounded-lg border-gray-300 dark:border-gray-700 rounded-lg h-1/2 md:h-28 mb-4">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl dark:text-white">
                  {`${patientDetails.user.first_name} ${patientDetails.user.last_name}'s Dashboard`}
                </h1>
                <p className="text-lg font-normal leading-tight tracking-tight text-gray-900 md:text-lg dark:text-gray-400">
                  {`${patientDetails.user.first_name}'s next treatment is scheduled for 21/09/2004 - in 3 days`}
                </p>
              </div>
            </div>

            {/* DOSES AND WEEKLY PASI TABLE */}
            {treatmentPlan ? (
              <div className="flex flex-col p-0 border-2 bg-white dark:bg-gray-800 rounded-lg border-gray-300 dark:border-gray-600 h-1/2 mb-4 shadow-md">
                <div className="overflow-x-auto sm:rounded-lg w-full h-full">
                  <table className="w-full h-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-200">
                      <tr>
                        <th scope="col" className="p-2">
                          UVB Dose
                        </th>
                        {/* Dynamically generate week headers */}
                        {Array.from(
                          {
                            length: treatmentPlan.WEEKS.length,
                          },
                          (_, i) => (
                            <th
                              key={`week_${i + 1}`}
                              id={`week_${i + 1}`}
                              scope="col"
                              className="p-2"
                            >
                              Week {i + 1}
                            </th>
                          )
                        )}
                        <div className="flex">
                          <button
                            onClick={toggleEditMode}
                            className={
                              "w-auto m-2 ml-auto inline-flex items-center font-medium rounded-lg text-sm px-3 py-2.5 text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 focus:ring-gray-300 text-white focus:outline-none focus:ring-4 dark:focus:ring-gray-800"
                            }
                          >
                            {editingTable ? (
                              <X
                                size={16}
                                className="text-gray-700 dark:text-gray-400"
                              />
                            ) : (
                              <Pencil
                                size={16}
                                className="text-gray-700 dark:text-gray-400"
                              />
                            )}
                          </button>
                          {Object.keys(editableSessions).length > 0 &&
                            editingTable && (
                              <button
                                onClick={handleSaveSessionChanges}
                                className="w-auto m-2 ml-auto inline-flex items-center font-medium rounded-lg text-sm px-3 py-2.5 text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 focus:ring-gray-300 text-white focus:outline-none focus:ring-4 dark:focus:ring-gray-800"
                              >
                                <Save
                                  size={16}
                                  className="text-gray-700 dark:text-gray-400"
                                />
                              </button>
                            )}
                        </div>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(
                        { length: treatmentPlan.WEEKLY_SESSIONS },
                        (_, session_index) => (
                          <tr
                            key={`session_row_${session_index + 1}`}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <th
                              scope="row"
                              key={`session_${session_index + 1}`}
                              className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                            >
                              {session_index + 1}
                            </th>
                            {/* Dynamically generate cells for each session in the week */}
                            {Array.from(
                              {
                                length:
                                  treatmentPlan.WEEKS
                                    .length /* Assuming 3 sessions per week */,
                              },
                              (_, weekIndex) => {
                                // Calculate the global session number
                                const sessionNumber =
                                  weekIndex * 3 + session_index + 1;
                                // Construct the session key (e.g., "session_1", "session_2", ...)
                                const sessionKey = `session_${sessionNumber}`;
                                // Access the session data dynamically from the WEEKS object
                                const sessionData =
                                  treatmentPlan.WEEKS[weekIndex][sessionKey];
                                return (
                                  <td
                                    id={`week_${
                                      weekIndex + 1
                                    }_session${sessionNumber}`}
                                    key={`week_${
                                      weekIndex + 1
                                    }_session${sessionNumber}`}
                                    className="p-2"
                                  >
                                    {sessionData.actual_dose === "" ? (
                                      <input
                                        disabled={!editingTable}
                                        className={`w-16 rounded-md border border-gray-300 text-gray-900 sm:text-sm ${
                                          editingTable
                                            ? "dark:bg-gray-500 bg-gray-200"
                                            : "dark:bg-gray-700 bg-gray-50"
                                        } dark:border-gray-600 dark:placeholder-gray-200 dark:text-white`}
                                        type="text"
                                        value={
                                          editingTable
                                            ? editableSessions[sessionKey]
                                            : sessionData.planned_dose
                                        }
                                        onChange={(e) =>
                                          handleSessionChange(
                                            sessionKey,
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      <input
                                        disabled
                                        className="w-16 font-bold rounded-md bg-blue-500 border border-gray-300 text-gray-50 sm:text-sm dark:bg-blue-500 dark:border-gray-700 dark:placeholder-gray-200 dark:text-white"
                                        type="text"
                                        value={sessionData.actual_dose}
                                      />
                                    )}
                                  </td>
                                );
                              }
                            )}
                          </tr>
                        )
                      )}
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <th
                          scope="row"
                          className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          End of week PASI
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 bg-white dark:bg-gray-800 rounded-lg border-gray-300 dark:border-gray-600 h-64 mb-4 shadow-md">
                <button
                  onClick={toggleModal}
                  className={
                    "w-1/3 inline-flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2.5 text-center bg-blue-700 hover:bg-blue-600 focus:ring-blue-300 text-white focus:outline-none focus:ring-4 dark:focus:ring-blue-800"
                  }
                >
                  <CirclePlus size={32} className="text-gray-50 mr-2" />
                  <h5 className="mb-1 text-xl font-medium text-gray-50">
                    Start Treatment
                  </h5>
                </button>

                {/* <!-- Main modal --> */}
                <div
                  hidden
                  id="defaultModal"
                  tabindex="-1"
                  aria-hidden="true"
                  className="backdrop-blur-sm overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
                >
                  <div className="relative p-4 w-full max-w-2xl h-full m-auto">
                    {/* <!-- Modal content --> */}
                    <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                      {/* <!-- Modal header --> */}
                      <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Start Treatment
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
                              fill-rule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          <span className="sr-only">Close modal</span>
                        </button>
                      </div>
                      {/* <!-- Modal body --> */}
                      <form onSubmit={handleStartTreatment}>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div className="relative sm:col-span-2">
                            <label
                              htmlFor="start_date"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Start Date
                            </label>
                            <Datepicker
                              name="start_date"
                              id="start_date"
                              options={dateOptions}
                              show={showDate}
                              setShow={handleDateClose}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div className="relative sm:col-span-1">
                            <label
                              htmlFor="weekly_sessions"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Sessions Per Week
                            </label>
                            <select
                              required
                              id="weekly_sessions"
                              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                              <option value="" disabled selected>
                                Select option
                              </option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3 (default)</option>
                            </select>
                            {/* <div>
                              <input
                                required
                                min={1}
                                max={7}
                                type="number"
                                name="weekly_sessions"
                                id="weekly_sessions"
                                pattern="[0-9]"
                                defaultValue={3}
                                className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                            </div> */}
                          </div>
                          <div className="relative sm:col-span-1">
                            <label
                              htmlFor="treatment_duration"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Treatment Duration
                            </label>
                            <select
                              required
                              id="treatment_duration"
                              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                              <option value="" disabled selected>
                                Select number of weeks
                              </option>
                              <option value="8">8 Weeks</option>
                              <option value="12">12 Weeks (default)</option>
                            </select>
                            {/* <div>
                              <input
                                required
                                min={2}
                                max={24}
                                type="number"
                                name="num-of-weeks"
                                id="num-of-weeks"
                                pattern="[0-9]"
                                defaultValue={12}
                                className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                            </div> */}
                          </div>
                        </div>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div className="relative sm:col-span-1">
                            <label
                              htmlFor="med"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Minimal Erythema Dose
                            </label>
                            <div>
                              <input
                                required
                                min={0}
                                type="number"
                                name="med"
                                id="med"
                                step="any"
                                className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="relative sm:col-span-1">
                            <label
                              htmlFor="pasi_pre_treatment"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              PASI Pre-treatment
                            </label>
                            <div>
                              <input
                                required
                                min={0}
                                type="number"
                                name="pasi_pre_treatment"
                                id="pasi_pre_treatment"
                                step="any"
                                className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <button
                            type="submit"
                            className="inline-flex m-auto font-medium rounded-lg text-sm px-5 py-2.5 text-center text-gray-50 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300"
                          >
                            Start Treatment
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE 1/3 */}
          <div className="col-span-1 grid-rows-1">
            {/* PROFILE CARD RIGHT-SIDE */}
            <div className="gap-4 p-6 flex flex-col border-2 bg-white dark:bg-gray-800 rounded-lg border-gray-300 dark:border-gray-600 h-auto md:h-auto mb-4">
              <div className="flex flex-row gap-2 w-full h-fit">
                <div className="h-fit">
                  <img
                    className="w-16 h-16 rounded-full shadow-lg"
                    src={profile}
                    alt="profile-pic"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {`ID: ${patientDetails.user.id}`}
                  </p>
                </div>
                <div className="h-fit">
                  <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                    {`${patientDetails.user.first_name} ${patientDetails.user.last_name}`}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {patientDetails.user.username}
                  </p>
                </div>
                <div className="h-fit ml-auto">
                  <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                    Other Info
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {patientDetails.contact_number || "+44 757 066 3465"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {patientDetails.dob || "D.O.B: October 31st, 2003"}
                  </p>
                </div>
              </div>
              <div>
                <h5 className="mb-1 text-base font-medium text-gray-900 dark:text-white">
                  Medical History:
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.
                </p>
              </div>
            </div>

            <div className="gap-2 p-6 flex border-2 bg-white dark:bg-gray-800 items-center rounded-lg border-gray-300 dark:border-gray-600 h-72 mb-4">
              <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                Here Will put the Re-calibrate UV Efficacy Parameter and Model
                Simulate button
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDetails;

// {
//   /*
//           <div className="border-2 bg-white dark:bg-gray-800  rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-96"></div>
//           <div className="col-span-3 border-2 bg-white dark:bg-gray-800  rounded-lg border-gray-300 dark:border-gray-600 h-96"></div> */
// }
// {
//   /* <div className="grid grid-cols-3 gap-4 mb-4">
//           <div className="col-span-2 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//           <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//           <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//           <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//           <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//         </div> */
// }
