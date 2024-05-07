import React from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Home,
  Calendar,
} from "lucide-react";
import profile from "../../assets/Profile.svg";

import { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "../Sidebar";

function PatientDashboard() {
  const [error, setError] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);

  const fetchPatientDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/users/get-patient-details/?patient_id=${localStorage.getItem(
          "userId"
        )}`
      );

      setPatientDetails(response.data);
      response.data.treatment &&
        setTreatmentPlan(response.data.treatment.treatment_plan);
      console.log(response.data);
    } catch (err) {
      setError("Failed to fetch patient details.");
    }
  };
  useEffect(() => {
    fetchPatientDetails();
  }, []);

  return (
    <div className="flex h-mx">
      <Sidebar className="">
        <a href="/">
          <SidebarItem icon={<Home size={20} />} text="Home" />
        </a>
        <a href="/dashboard">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            text="Dashboard"
            active
          />
        </a>
        <SidebarItem icon={<Calendar size={20} />} text="Calendar" />
      </Sidebar>
      <div className="w-full h-full p-4 h-auto pt-8">
        {patientDetails && (
          <div className="grid grid-cols-3 gap-4 mb-4 h-auto md:h-full">
            {/* LEFT SIDE 2/3 */}
            <div className="col-span-2">
              <div className="p-6 border-2 bg-white dark:bg-gray-800 gap-2 flex flex-col justify-center rounded-lg border-gray-300 dark:border-gray-700 rounded-lg h-1/2 md:h-28 mb-4">
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl dark:text-white">
                    {`My Dashboard`}
                  </h1>
                  <p className="text-lg font-normal leading-tight tracking-tight text-gray-900 md:text-lg dark:text-gray-400">
                    {`Your next treatment is scheduled for 29/03/2024 - in 2 days`}
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

                                        <button className="w-16 py-2 rounded-md border border-gray-300 text-gray-900 sm:text-sm bg-gray-50 hover:bg-gray-200 dark:bg-gray-700 hover:dark:bg-gray-500 dark:border-gray-600 dark:placeholder-gray-200 dark:text-white">
                                          {sessionData.planned_dose || "-"}
                                        </button>
                                      ) : (
                                        <button className="w-16 py-2 font-bold rounded-md bg-blue-500 border border-gray-300 text-gray-50 sm:text-sm dark:bg-blue-500 dark:border-gray-700 dark:placeholder-gray-200 dark:text-white">
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
                            const sessionKeys = Object.keys(week).filter(
                              (key) => key.startsWith("session_")
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

                                  <button className="w-16 py-2 font-bold rounded-md bg-gray-500 border border-gray-300 text-gray-50 sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-200 dark:text-white">
                                    {week.end_week_pasi || "-"}
                                  </button>
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
                <div></div>
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
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
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
                  ) || (
                    <p className="p-2 mr-2 text-xl font-medium text-gray-900 dark:text-white">
                      No Weeks Completed
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;
