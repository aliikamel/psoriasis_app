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
  CirclePlus
} from "lucide-react";
import profile from "../../assets/Profile.svg";

function PatientDetails() {
  const { patientId } = useParams();
  const [patientDetails, setPatientDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/get-patient-details/?patient_id=${patientId}`
        );
        setPatientDetails(response.data);
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
            {patientDetails.treatment.length > 0 ? (
              <div className="flex flex-col p-0 border-2 bg-white dark:bg-gray-800 rounded-lg border-gray-300 dark:border-gray-600 h-1/2 mb-4 shadow-md">
                <div className="overflow-x-auto sm:rounded-lg w-full h-full">
                  <table className="w-full h-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-200">
                      <tr>
                        <th scope="col" className="p-2">
                          UVB Dose
                        </th>
                        {/* Dynamically generate week headers */}
                        {Array.from({ length: 12 }, (_, i) => (
                          <th key={i} scope="col" className="p-2">
                            Week {i + 1}
                          </th>
                        ))}
                        <th scope="col" className="p-2">
                          <button
                            type="submit"
                            className={
                              "w-auto mt-2 ml-auto inline-flex items-center font-medium rounded-lg text-sm px-3 py-2.5 text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 focus:ring-gray-300 text-white focus:outline-none focus:ring-4 dark:focus:ring-gray-800"
                            }
                          >
                            <Pencil
                              size={16}
                              className="text-gray-700 dark:text-gray-400"
                            />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 3 }, (_, i) => (
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <th
                            scope="row"
                            className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                          >
                            {i + 1}
                          </th>
                          {/* Dynamically generate week headers */}
                          {Array.from({ length: 12 }, (_, i) => (
                            <td key={i} className="p-2">
                              <input
                                disabled
                                className="w-12 rounded-md bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-200 dark:text-white"
                                type="text"
                                placeholder={i + 1}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
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
                  type="submit"
                  className={
                    "w-1/3 inline-flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2.5 text-center bg-blue-700 hover:bg-blue-600 focus:ring-blue-300 text-white focus:outline-none focus:ring-4 dark:focus:ring-blue-800"
                  }
                >
                  <CirclePlus size={32} className="text-gray-50 mr-2" />
                  <h5 className="mb-1 text-xl font-medium text-gray-50">
                    Start Treatment
                  </h5>
                </button>
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
