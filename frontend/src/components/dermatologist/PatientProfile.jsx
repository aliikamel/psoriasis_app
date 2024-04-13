import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar";
import MyPlotComponent from "./MyPlotComponent";
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
  Crosshair,
  CirclePlay,
  Upload
} from "lucide-react";
import profile from "../../assets/Profile.svg";
import Datepicker from "tailwind-datepicker-react";

function PatientDetails() {
  const { patientId } = useParams();
  const [patientDetails, setPatientDetails] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSessionDate, setShowSessionDate] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showPasiPreDate, setShowPasiPreDate] = useState(false);
  const [editingTable, setEditingTable] = useState(false);
  // this is for the quick editing functionality
  const [editableSessions, setEditableSessions] = useState({});
  const [editableWeeks, setEditableWeeks] = useState({});
  const [missedOpenedSession, setMissedOpenedSession] = useState(false);
  // the details of the selected session to be displayed in modal
  const [openedSessionDetails, setOpenedSessionedDetails] = useState({});
  const [uvEff, setUvEff] = useState({});
  const [calculatingUvEff, setCalculatingUvEff] = useState(false);
  const [simulationPlot, setSimulationPlot] = useState({});
  const [simulatingModel, setSimulatingModel] = useState(false);

  const dateOptions = {
    inputPlaceholderProp: "Select Date",
    language: "en-GB",
    clearBtn: false,
    inputDateFormatProp: {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    },
  };

  const formatDate = (date, join_char) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return join_char === "/"
      ? [day, month, year].join(join_char)
      : [year, month, day].join(join_char);
  };

  const handleDateClose = (datepicker) => {
    if (datepicker === "start_date") {
      setShowStartDate(!showStartDate);
    }
    if (datepicker === "pasi_treatment_date") {
      setShowPasiPreDate(!showPasiPreDate);
    }
    if (datepicker === "session_date") {
      setShowSessionDate(!showSessionDate);
    }
  };

  const formatSessionString = (str) => {
    // Split the string into parts based on the underscore
    let parts = str.split("_");

    // Capitalize the first letter of the first part
    let word = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);

    // Join the parts together with a space and return
    return `${word} ${parts[1]}`;
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
  const handleSessionChange = (sessionKey, rawValue, property) => {
    if (property === "missed_session") {
      setMissedOpenedSession(rawValue);
    }
    // Only process if the property is actual_dose or planned_dose
    if (property === "actual_dose" || property === "planned_dose") {
      // Use a regular expression to validate the format: up to 2 digits before the decimal, up to 3 after
      // This regex will match a valid number or an empty string, ensuring we don't process invalid formats
      const validFormatRegex = /^(?:\d{0,2}(?:\.\d{0,3})?)?$/;

      if (!validFormatRegex.test(rawValue)) {
        return; // Don't update the state if the input is invalid
      }

      // If the input is valid, proceed to update the state
      setEditableSessions((prevState) => ({
        ...prevState,
        [sessionKey]: {
          ...prevState[sessionKey],
          [property]: rawValue === "" ? "" : Number(rawValue),
        },
      }));
    } else {
      // For other properties, update the state without format validation
      setEditableSessions((prevState) => ({
        ...prevState,
        [sessionKey]: {
          ...prevState[sessionKey],
          [property]: rawValue === "" ? "" : rawValue,
        },
      }));
    }
  };

  // Update editableWeeks state upon input change
  const handleWeekChange = (week_index, newValue, property) => {
    setEditableWeeks((prevState) => ({
      ...prevState,
      [week_index]: {
        ...prevState[week_index],
        [property]: newValue === "" ? "" : Number(newValue),
      },
    }));
  };

  const handleSaveChanges = () => {
    setEditingTable(false);

    // Clone the current treatmentPlan to avoid direct state mutation
    let updatedTreatmentPlan = JSON.parse(JSON.stringify(treatmentPlan));

    // Update sessions if any sessions have been edited
    Object.keys(editableSessions).forEach((sessionKey) => {
      updatedTreatmentPlan.WEEKS.forEach((week, weekIndex) => {
        if (sessionKey in week) {
          const editableSession = editableSessions[sessionKey];
          const session = week[sessionKey];
          console.log(editableSession);

          // Apply updates to session properties
          if ("planned_dose" in editableSession) {
            session.planned_dose = editableSession.planned_dose;
          }
          if ("actual_dose" in editableSession) {
            session.actual_dose = editableSession.actual_dose;
          }
          if ("date" in editableSession) {
            session.date = formatDate(editableSession.date, "/");
          }
          if ("missed_session" in editableSession) {
            if (editableSession.missed_session) {
              session.actual_dose = 0;
              session["missed_session"] = 1;
            } else {
              session["missed_session"] = 0;
            }
          }
        }
      });
    });

    // Update weeks if any pasi_end_week has been edited
    Object.keys(editableWeeks).forEach((weekKey) => {
      const weekIndex = parseInt(weekKey, 10); // Convert weekKey to a number
      const weekUpdates = editableWeeks[weekKey];

      // Ensure the week index is within range
      if (weekIndex >= 0 && weekIndex < updatedTreatmentPlan.WEEKS.length) {
        const week = updatedTreatmentPlan.WEEKS[weekIndex];
        // Apply updates to week properties
        if ("end_week_pasi" in weekUpdates) {
          // only update if the value is a new value
          if (week.end_week_pasi !== weekUpdates.end_week_pasi) {
            console.log("Entered to remove uv_eff");
            week.end_week_pasi = weekUpdates.end_week_pasi;
            // in case end_week_pasi gets changed
            week.uv_eff = "";
          }
        }
        // Add more properties here later for status and such
      }
    });

    // set weeks to complete or incomplete based on actual_dose and pasi_end_week being filled in
    updatedTreatmentPlan.WEEKS.forEach((week, index) => {
      const sessionKeys = Object.keys(week).filter((key) =>
        key.startsWith("session_")
      );

      const weekCompleted = sessionKeys.every((sessionKey) => {
        return week[sessionKey].actual_dose !== "" && week.end_week_pasi !== "";
      });

      if (weekCompleted) {
        week.status = "completed";
      } else {
        week.status = "not_completed";
        week.end_week_pasi = "";
        week.uv_eff = "";
      }
    });

    // If uvEff, set most recently complete week with that uv_eff
    if (Object.keys(uvEff).length > 0) {
      // Reverse loop through the weeks to find the last complete week
      for (let i = updatedTreatmentPlan.WEEKS.length - 1; i >= 0; i--) {
        const week = updatedTreatmentPlan.WEEKS[i];
        if (week.status === "completed") {
          week.uv_eff = uvEff.best_uv_eff;
          break;
        }

        // const sessions = Object.values(week).filter(
        //   (session) =>
        //     session.hasOwnProperty("actual_dose") ||
        //     session.hasOwnProperty("planned_dose")
        // ); // Assuming each week object directly contains session objects

        // // Check if all sessions in the week have an actual_dose defined
        // const allSessionsCompleted = sessions.every(
        //   (session) =>
        //     session.actual_dose !== undefined && session.actual_dose !== ""
        // );

        // // Check if end_week_pasi is defined for the week
        // const isEndWeekPasiDefined =
        //   week.end_week_pasi !== undefined && week.end_week_pasi !== "";

        // // If all sessions are completed and end_week_pasi is defined, this is the last complete week
        // if (allSessionsCompleted && isEndWeekPasiDefined) {
        //   week.uv_eff = uvEff.best_uv_eff;
        //   break; // Exit the loop after updating the last complete week
        // }
      }
    }

    // Now set the updated treatment plan in the state and clear editableSessions and editableWeeks
    setEditableSessions({});
    setEditableWeeks({});
    console.log(updatedTreatmentPlan);
    setTreatmentPlan(updatedTreatmentPlan);
    updatePatientTreatment(updatedTreatmentPlan);
  };

  const handleOpenSessionModal = (session_key, session_data) => {
    setOpenedSessionedDetails({ [session_key]: session_data });
  };

  useEffect(() => {
    // This useEffect reacts to changes in openedSessionDetails
    if (Object.keys(openedSessionDetails).length > 0) {
      toggleModal("edit_session_modal");
    }
  }, [openedSessionDetails]);

  const handleMissedSessionCheck = (e) => {
    setMissedOpenedSession(e.target.checked);
  };

  const getUpdatedDateOptions = (openedSessionDetails, existingOptions) => {
    const sessionKey = Object.keys(openedSessionDetails)[0];
    const sessionData = openedSessionDetails[sessionKey];
    if (sessionData && sessionData.date) {
      // Convert the date from "dd/mm/yyyy" to "yyyy-mm-dd"
      const parts = sessionData.date.split("/");
      const formattedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

      // Return the merged options
      return { ...existingOptions, defaultDate: formattedDate };
    }
    return existingOptions;
  };

  const updatePatientTreatment = async (update_treatment_plan) => {
    let treatment = patientDetails.treatment;
    treatment.treatment_plan = update_treatment_plan;
    let formattedData = {
      treatment: treatment,
    };

    const cleanedTreatment = JSON.stringify(formattedData);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/users/update-patient-treatment/`,
        cleanedTreatment,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API Response:", response.data);
    } catch (error) {
      console.log("API Response:", error);
      setError("Error fetching data. Please try again THIS ONE.");
    }
  };

  const fetchPatientDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/users/get-patient-details/?patient_id=${patientId}`
      );

      setPatientDetails(response.data);
      response.data.treatment &&
        setTreatmentPlan(response.data.treatment.treatment_plan);
      setIsLoading(false);
      console.log(response.data);
    } catch (err) {
      setError("Failed to fetch patient details.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const toggleModal = (modal_id) => {
    // ERROR IS COMING FROM HERE AS ELEMENT ISNT RENDERED YET on first click
    let modal = document.getElementById(modal_id);
    modal && (modal.hidden ? (modal.hidden = false) : (modal.hidden = true));
    if (modal_id === "edit_session_modal") {
      setEditableSessions({});
      setMissedOpenedSession(false);
      if (modal.hidden) {
        setOpenedSessionedDetails({});
      }
    }
  };

  const handleStartTreatment = async (e) => {
    e.preventDefault();
    let data = e.target;
    console.log(data);
    let formattedData = {
      patient_profile_id: `${patientDetails.user.patient_profile}`,
      pasi_pre_treatment_date: data[0].value,
      pasi_pre_treatment: data[1].value,
      med: data[2].value,
      start_date: data[3].value,
      weekly_sessions: data[4].value,
      num_of_weeks: data[5].value,
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
      // close the modal and refetch the patient details
      fetchPatientDetails();
      toggleModal("create_treatment_modal");
    } catch (error) {
      console.log("API Response:", error);
      setError("Error fetching data. Please try again.");
    }
  };

  const handleCalibrateUvEff = async () => {
    const cleanedTreatmentPlan = JSON.stringify(treatmentPlan);
    setCalculatingUvEff(true);

    console.log(cleanedTreatmentPlan);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/model/fit-uv-eff/",
        cleanedTreatmentPlan
      );
      console.log("API Response:", response.data);
      setUvEff(response.data);

      // Handle success here (e.g., showing a success message, redirecting, etc.)
    } catch (error) {
      console.error("API Error:", error.response);
      // Handle error here (e.g., showing an error message)
    }

    setCalculatingUvEff(false);
  };

  useEffect(() => {
    // Check if uvEff state is not empty
    if (Object.keys(uvEff).length > 0) {
      // If uvEff is not empty, call handleSaveChanges
      handleSaveChanges();
    }
  }, [uvEff]); // Depend on uvEff to trigger this effect

  const handleSimulateModel = async () => {
    setSimulatingModel(true);
    let uv_eff;
    let treatment = patientDetails.treatment;
    // Reverse loop through the weeks to find the last complete week
    for (let i = treatmentPlan.WEEKS.length - 1; i >= 0; i--) {
      const week = treatmentPlan.WEEKS[i];
      if (week.uv_eff !== "" && week.uv_eff !== 0) {
        uv_eff = week.uv_eff;
        break;
      }
    }

    let full_data = { uv_eff: uv_eff, treatment: treatment };
    let formattedData = JSON.stringify(full_data);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/model/simulate-model/",
        formattedData
      );
      console.log("API Response:", response.data);
      preparePlotData(response.data);

      // Handle success here (e.g., showing a success message, redirecting, etc.)
    } catch (error) {
      console.error("API Error:", error.response);
      // Handle error here (e.g., showing an error message)
    }
    setSimulatingModel(false);
  };

  const preparePlotData = (data) => {
    let plot_data = {};

    plot_data["x"] = data.x;
    plot_data["y"] = data.y;
    plot_data["pasis"] = data.actual_pasis['pasis'];
    plot_data["time_pasis"] = data.actual_pasis["time_pasis"];
    plot_data["abnormal_pasis"] = data.anomalies["abnormal_pasis"]
    plot_data["abnormal_time_pasis"] = data.anomalies["abnormal_time_pasis"];
    

    // Reverse loop through the weeks to find the last complete week
    for (let i = treatmentPlan.WEEKS.length - 1; i >= 0; i--) {
      const week = treatmentPlan.WEEKS[i];
      if (week.uv_eff !== "") {
        plot_data["curr_week"] = i + 1;
        break;
      }
    }

    // let end_week_pasis = {};
    // treatmentPlan.WEEKS.forEach((week, index) => {
    //   if (week.end_week_pasi !== "") {
    //     end_week_pasis[index + 1] = week.end_week_pasi;
    //   }
    // });

    // Reverse loop through the weeks to find the last complete week
    for (let i = treatmentPlan.WEEKS.length - 1; i >= 0; i--) {
      const week = treatmentPlan.WEEKS[i];
      if (week.uv_eff !== "" && week.uv_eff !== 0) {
        plot_data["uv_eff"] = week.uv_eff;
        break;
      }
    }

    // plot_data["end_week_pasis"] = end_week_pasis;

    plot_data["pasi_pre_treatment"] = treatmentPlan.PASI_PRE_TREATMENT;
    plot_data["weeks"] = treatmentPlan.WEEKS.length;

    setSimulationPlot(plot_data);
    console.log(plot_data);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
      </Sidebar>
      <div className="w-full h-full p-4 pt-8">
        {/* <!-- EDIT SESSION DETAILS MODAL --> */}
        {Object.keys(openedSessionDetails).length > 0 && (
          <div
            hidden
            id="edit_session_modal"
            tabIndex="-1"
            aria-hidden="true"
            className="backdrop-blur-sm overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
          >
            <div className="relative p-4 w-full h-full">
              {/* <!-- Modal content --> */}
              <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5 h-fit m-auto mt-24 w-1/3">
                {/* <!-- Modal header --> */}
                <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {openedSessionDetails &&
                      formatSessionString(Object.keys(openedSessionDetails)[0])}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-toggle="defaultModal"
                    onClick={() => toggleModal("edit_session_modal")}
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
                <form onSubmit={handleSaveChanges}>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    <div className="relative sm:col-span-2">
                      <label
                        htmlFor="date"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Session Date
                      </label>
                      <Datepicker
                        key={`date-picker-${
                          Object.keys(openedSessionDetails)[0]
                        }`}
                        options={getUpdatedDateOptions(
                          openedSessionDetails,
                          dateOptions
                        )}
                        show={showSessionDate}
                        setShow={() => handleDateClose("session_date")}
                        onChange={(newDateValue) =>
                          handleSessionChange(
                            Object.keys(openedSessionDetails)[0],
                            formatDate(newDateValue, "-"),
                            "date"
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    <div className="relative sm:col-span-1">
                      <label
                        htmlFor="planned_dose"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Planned Dose
                      </label>
                      <div>
                        <input
                          min={0}
                          type="number"
                          name="planned_dose"
                          id="planned_dose"
                          step="0.001"
                          value={
                            editableSessions[
                              Object.keys(openedSessionDetails)[0]
                            ] &&
                            "planned_dose" in
                              editableSessions[
                                Object.keys(openedSessionDetails)[0]
                              ]
                              ? editableSessions[
                                  Object.keys(openedSessionDetails)[0]
                                ].planned_dose
                              : openedSessionDetails[
                                  Object.keys(openedSessionDetails)[0]
                                ].planned_dose
                          }
                          onChange={(e) =>
                            handleSessionChange(
                              Object.keys(openedSessionDetails)[0],
                              e.target.value,
                              "planned_dose"
                            )
                          }
                          className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="relative sm:col-span-1">
                      <label
                        htmlFor="actual_dose"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Actual Dose
                      </label>
                      <div>
                        {/* FOR THE OPENED SESSION DETAILS */}
                        {Object.keys(openedSessionDetails).map(
                          (session_key) => {
                            let sessionMissed =
                              editableSessions[
                                Object.keys(openedSessionDetails)[0]
                              ] &&
                              "missed_session" in
                                editableSessions[
                                  Object.keys(openedSessionDetails)[0]
                                ]
                                ? editableSessions[
                                    Object.keys(openedSessionDetails)[0]
                                  ].missed_session === 1
                                : openedSessionDetails[
                                    Object.keys(openedSessionDetails)[0]
                                  ].missed_session === 1;

                            console.log(sessionMissed);

                            return sessionMissed ? (
                              <input
                                disabled
                                type="text"
                                name="actual_dose"
                                id="disabled_actual_dose"
                                value=""
                                className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                            ) : (
                              <input
                                min={0}
                                type="number"
                                name="actual_dose"
                                id="actual_dose"
                                step="0.001"
                                value={
                                  editableSessions[
                                    Object.keys(openedSessionDetails)[0]
                                  ] &&
                                  "actual_dose" in
                                    editableSessions[
                                      Object.keys(openedSessionDetails)[0]
                                    ]
                                    ? editableSessions[
                                        Object.keys(openedSessionDetails)[0]
                                      ].actual_dose
                                    : openedSessionDetails[
                                        Object.keys(openedSessionDetails)[0]
                                      ].actual_dose
                                }
                                onChange={(e) =>
                                  handleSessionChange(
                                    Object.keys(openedSessionDetails)[0],
                                    e.target.value,
                                    "actual_dose"
                                  )
                                }
                                className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center py-4">
                    <input
                      checked={
                        editableSessions[
                          Object.keys(openedSessionDetails)[0]
                        ] &&
                        "missed_session" in
                          editableSessions[Object.keys(openedSessionDetails)[0]]
                          ? editableSessions[
                              Object.keys(openedSessionDetails)[0]
                            ].missed_session
                          : openedSessionDetails[
                              Object.keys(openedSessionDetails)[0]
                            ].missed_session
                      }
                      id="missed-session-checkbox"
                      type="checkbox"
                      value=""
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      // onChange={handleMissedSessionCheck}
                      onChange={(e) =>
                        handleSessionChange(
                          Object.keys(openedSessionDetails)[0],
                          e.target.checked,
                          "missed_session"
                        )
                      }
                    />
                    <label
                      htmlFor="missed-session-checkbox"
                      className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Missed Session
                    </label>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="inline-flex m-auto font-medium rounded-lg text-sm px-5 py-2.5 text-center text-gray-50 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-4 h-auto md:h-full">
          {/* LEFT SIDE 2/3 */}
          <div className="col-span-2">
            <div className="p-6 border-2 bg-white dark:bg-gray-800 gap-2 flex flex-col justify-center rounded-lg border-gray-300 dark:border-gray-700 rounded-lg h-1/2 md:h-28 mb-4">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl dark:text-white">
                  {`${patientDetails.user.first_name} ${patientDetails.user.last_name}'s Dashboard`}
                </h1>
                <p className="text-lg font-normal leading-tight tracking-tight text-gray-900 md:text-lg dark:text-gray-400">
                  {`${patientDetails.user.first_name}'s next treatment is scheduled for 29/03/2024 - in 2 days`}
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
                          {(Object.keys(editableSessions).length > 0 ||
                            Object.keys(editableWeeks).length > 0) &&
                            editingTable && (
                              <button
                                onClick={handleSaveChanges}
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
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
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
                                  weekIndex * treatmentPlan.WEEKLY_SESSIONS +
                                  session_index +
                                  1;
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
                                      /* dark:hover:bg-blue-700 cursor:pointer */
                                      editingTable ? (
                                        <input
                                          step="0.001"
                                          className={
                                            "w-16 text-center rounded-md border border-gray-300 text-gray-900 sm:text-sm dark:bg-gray-500 bg-gray-200 hover:bg-blue-50 dark:border-gray-600 dark:placeholder-gray-200 dark:text-white"
                                          }
                                          type="number"
                                          value={
                                            editableSessions[sessionKey] &&
                                            "planned_dose" in
                                              editableSessions[sessionKey]
                                              ? editableSessions[sessionKey]
                                                  .planned_dose
                                              : sessionData.planned_dose
                                          }
                                          onChange={(e) =>
                                            handleSessionChange(
                                              sessionKey,
                                              e.target.value,
                                              "planned_dose"
                                            )
                                          }
                                        />
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleOpenSessionModal(
                                              sessionKey,
                                              sessionData
                                            )
                                          }
                                          className="w-16 py-2 rounded-md border border-gray-300 text-gray-900 sm:text-sm bg-gray-50 hover:bg-gray-200 dark:bg-gray-700 hover:dark:bg-gray-500 dark:border-gray-600 dark:placeholder-gray-200 dark:text-white"
                                        >
                                          {sessionData.planned_dose || "-"}
                                        </button>
                                      )
                                    ) : editingTable ? (
                                      <input
                                        step="0.001"
                                        disabled
                                        className="w-16 text-center font-bold rounded-md bg-blue-500 border border-gray-300 text-gray-50 sm:text-sm dark:bg-blue-500 dark:border-gray-700 dark:placeholder-gray-200 dark:text-white"
                                        type="number"
                                        value={sessionData.actual_dose}
                                      />
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleOpenSessionModal(
                                            sessionKey,
                                            sessionData
                                          )
                                        }
                                        className="w-16 py-2 font-bold rounded-md bg-blue-500 border border-gray-300 text-gray-50 sm:text-sm dark:bg-blue-500 dark:border-gray-700 dark:placeholder-gray-200 dark:text-white"
                                      >
                                        {sessionData.actual_dose}
                                      </button>
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
                        {treatmentPlan.WEEKS.map((week, index) => {
                          // Filter out session keys from the week object
                          const sessionKeys = Object.keys(week).filter((key) =>
                            key.startsWith("session_")
                          );

                          // Check if all sessions in the week are completed (i.e., have a non-empty actual_dose)
                          const allSessionsCompleted = sessionKeys.every(
                            (sessionKey) => {
                              return week[sessionKey].actual_dose !== "";
                            }
                          );

                          return (
                            <td
                              key={`end_of_week_${index + 1}_pasi`}
                              className="p-2"
                            >
                              {allSessionsCompleted ? (
                                // If all sessions in the week are completed, render an input or any other element
                                editingTable ? (
                                  <input
                                    step="0.001"
                                    className="w-16 text-center font-bold rounded-md bg-blue-500 border border-gray-300 text-gray-50 sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-200 dark:text-white"
                                    type="number"
                                    onChange={(e) =>
                                      handleWeekChange(
                                        index,
                                        e.target.value,
                                        "end_week_pasi"
                                      )
                                    }
                                    value={
                                      editableWeeks[index] &&
                                      "end_week_pasi" in editableWeeks[index]
                                        ? editableWeeks[index].end_week_pasi
                                        : week.end_week_pasi
                                    }
                                  />
                                ) : (
                                  <button className="w-16 py-2 font-bold rounded-md bg-gray-500 border border-gray-300 text-gray-50 sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-200 dark:text-white">
                                    {week.end_week_pasi || "-"}
                                  </button>
                                )
                              ) : (
                                <></>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <th
                          scope="row"
                          className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          UV Efficacy
                        </th>
                        {treatmentPlan.WEEKS.map((week, index) => {
                          return (
                            <td
                              className="p-2"
                              key={`week_${index + 1}_uv_eff`}
                            >
                              {week.uv_eff !== "" && (
                                <button
                                  disabled
                                  className="w-16 py-2 font-bold rounded-md bg-white border border-gray-300 text-gray-700 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-200 dark:text-white"
                                >
                                  {week.uv_eff}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 bg-white dark:bg-gray-800 rounded-lg border-gray-300 dark:border-gray-600 h-64 mb-4 shadow-md">
                <button
                  onClick={() => toggleModal("create_treatment_modal")}
                  className={
                    "w-1/3 inline-flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2.5 text-center bg-blue-700 hover:bg-blue-600 focus:ring-blue-300 text-white focus:outline-none focus:ring-4 dark:focus:ring-blue-800"
                  }
                >
                  <CirclePlus size={32} className="text-gray-50 mr-2" />
                  <h5 className="mb-1 text-xl font-medium text-gray-50">
                    Start Treatment
                  </h5>
                </button>

                {/* <!-- CREATE TREATMENT MODAL --> */}
                <div
                  hidden
                  id="create_treatment_modal"
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
                          Start Treatment
                        </h3>
                        <button
                          type="button"
                          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                          data-modal-toggle="defaultModal"
                          onClick={() => toggleModal("create_treatment_modal")}
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
                      <form onSubmit={handleStartTreatment}>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div className="relative col-span-2">
                            <label
                              htmlFor="pasi_treatment_date"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              PASI Pre-Treatment Collection Date
                            </label>
                            <Datepicker
                              name="pasi_treatment_date"
                              id="pasi_treatment_date"
                              options={dateOptions}
                              show={showPasiPreDate}
                              setShow={() =>
                                handleDateClose("pasi_treatment_date")
                              }
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div className="relative">
                            <label
                              htmlFor="pasi_pre_treatment"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              PASI Pre-treatment
                            </label>
                            <div>
                              <input
                                step="0.001"
                                required
                                min={0}
                                type="number"
                                name="pasi_pre_treatment"
                                id="pasi_pre_treatment"
                                className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label
                              htmlFor="med"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Minimal Erythema Dose
                            </label>
                            <div>
                              <input
                                step="0.001"
                                required
                                min={0}
                                type="number"
                                name="med"
                                id="med"
                                className="block bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div className="relative sm:col-span-2">
                            <label
                              htmlFor="start_date"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Treatment Start Date{" "}
                              <span className="dark:text-gray-300 text-xs">
                                (day of first session)
                              </span>
                            </label>
                            <Datepicker
                              name="start_date"
                              id="start_date"
                              options={dateOptions}
                              show={showStartDate}
                              setShow={() => handleDateClose("start_date")}
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
                              name="weekly_sessions"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                              <option value="" disabled selected>
                                Select option
                              </option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3 (default)</option>
                            </select>
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
                              name="treatment_duration"
                              id="treatment_duration"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                              <option value="" disabled selected>
                                Select number of weeks
                              </option>
                              <option value="8">8 Weeks</option>
                              <option value="12">12 Weeks (default)</option>
                            </select>
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

            {Object.keys(simulationPlot).length > 0 && (
              <div className="p-6 border-2 bg-white dark:bg-gray-800 gap-2 flex flex-col justify-center rounded-lg border-gray-300 dark:border-gray-700 rounded-lg h-auto md:h-auto mb-4">
                <MyPlotComponent plotData={simulationPlot} />
              </div>
            )}
            {/* <div className="p-6 border-2 bg-white dark:bg-gray-800 gap-2 flex flex-col justify-center rounded-lg border-gray-300 dark:border-gray-700 rounded-lg h-auto md:h-auto mb-4">
              <MyPlotComponent plotData={simulationPlot} />
            </div> */}
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
                    {patientDetails.contact_number || "+44 123 456 7890"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {patientDetails.dob || "D.O.B: October 30th, 2003"}
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
            {treatmentPlan && (
              <div className="p-6 flex flex-col border-2 bg-white dark:bg-gray-800 items-center rounded-lg border-gray-300 dark:border-gray-600 h-auto mb-4">
                {treatmentPlan.WEEKS.map((week, index) => {
                  if (week.status === "completed") {
                    return (
                      <div
                        key={`week_${index + 1}_status`}
                        className="flex w-full p-2 justify-center"
                      >
                        <p className="p-2 text-xl font-medium text-gray-900 dark:text-white">{`Week ${
                          index + 1
                        } Completed `}</p>
                      </div>
                    );
                  } else {
                    return <></>;
                  }
                })}
                {treatmentPlan.WEEKS.some(
                  (week) => week.status === "completed"
                ) ? (
                  <div className="flex w-full p-2 justify-center">
                    {calculatingUvEff ? (
                      <div
                        className="flex justify-center text-center py-2 px-20 rounded-lg dark:bg-blue-600"
                        role="status"
                      >
                        <svg
                          aria-hidden="true"
                          className="w-8 h-8 text-gray-700 animate-spin dark:text-gray-50 fill-gray-600"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleCalibrateUvEff}
                        className="inline-flex items-center font-medium rounded-lg text-lg px-5 py-2.5 text-gray-50 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300"
                      >
                        <Crosshair size={18} className="mr-2" />
                        Calibrate UV-Efficacy
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="p-2 mr-2 text-xl font-medium text-gray-900 dark:text-white">
                    Complete a week by inputting an{" "}
                    <span className="font-bold bg-gray-200 dark:bg-gray-600 rounded-lg px-2 py-1">
                      End of week PASI
                    </span>{" "}
                    value
                  </p>
                )}
              </div>
            )}
            {/* ONLY RENDER IF THERE IS A UV_EFF VALUE INPUTTED */}
            {treatmentPlan &&
              treatmentPlan.WEEKS.some((week) => week.uv_eff !== "") && (
                <div className="p-6 flex flex-col border-2 bg-white dark:bg-gray-800 items-center rounded-lg border-gray-300 dark:border-gray-600 h-auto mb-4">
                  {treatmentPlan.WEEKS.map((week, index) => {
                    if (week.uv_eff !== "") {
                      return (
                        <div key={`week_${index + 1}_summary`}>
                          <p className="p-2 mr-2 text-xl font-medium text-gray-900 dark:text-white">
                            {`Week ${index + 1}: UV Efficacy `}
                            <span className="font-bold bg-gray-200 dark:bg-gray-600 rounded-lg px-2 py-1">
                              {week.uv_eff}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return <></>;
                  })}
                  <div>
                    {simulatingModel ? (
                      <div
                        className="flex justify-center text-center py-2 px-20 rounded-lg dark:bg-blue-600"
                        role="status"
                      >
                        <svg
                          aria-hidden="true"
                          className="w-8 h-8 text-gray-700 animate-spin dark:text-gray-50 fill-gray-600"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleSimulateModel}
                        className="inline-flex items-center font-medium rounded-lg text-lg px-5 py-2.5 text-gray-50 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300"
                      >
                        <CirclePlay size={24} className="mr-2" />
                        Simulate Model
                      </button>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDetails;

/* //   
//           <div className="border-2 bg-white dark:bg-gray-800  rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-96"></div>
//           <div className="col-span-3 border-2 bg-white dark:bg-gray-800  rounded-lg border-gray-300 dark:border-gray-600 h-96"></div> */
//
//
//    <div className="grid grid-cols-3 gap-4 mb-4">
//           <div className="col-span-2 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//           <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//           <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//           <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//           <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
//         </div>
//  */}
