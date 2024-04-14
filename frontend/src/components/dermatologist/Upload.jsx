import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar, { SidebarItem } from "../Sidebar";
import {
  LayoutDashboard,
  Home,
  Layers,
  Calendar,
  UsersRound,
  BrainCircuit,
  Upload,
  Infinity,
  User,
  Users,
  Trash2,
  Check,
  FileDown,
  Minus,
} from "lucide-react";

function Upload_run() {
  const [file, setFile] = useState(null);
  const [option, setOption] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null); // State to hold the URL for downloading
  const [downloadReady, setDownloadReady] = useState(false); // State to manage visibility of download link
  const [progress, setProgress] = useState({
    simulating: "",
    progress: "",
    completed: [],
    patients: [],
  });
  const [isSimulating, setIsSimulating] = useState(false);

  const handleOptionChange = (selected_option) => {
    if (selected_option === option) {
      setOption(null);
    } else {
      setOption(selected_option);
    }
  };

  const clear = () => {
    setOption(null);
    setFile(null);
    setDownloadUrl(null);
    setDownloadReady(false);
    setProgress({
      simulating: "",
      progress: "",
      completed: [],
      patients: [],
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // must match key that backend expects
    setIsSimulating(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/model/simulate-file/",
        formData, // Send formData instead of raw file
        {
          headers: {
            "Content-Type": "multipart/form-data", // This header tells the server to expect form data
          },
          responseType: "blob", // Important for handling binary data like files
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      setDownloadReady(true);
      setIsSimulating(false);
      console.log("File is ready for download");
    } catch (error) {
      console.error("API Error:", error.response);
      // Handle error here (e.g., showing an error message)
    }
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/simulate/");
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data); // Parses the WebSocket message
      console.log("Simulating:", message["simulating"]);
      console.log("Progress:", message["progress"]);
      console.log("Completed:", message["completed"]);
      console.log("ALL PATIENTS: ", message["patients"]);

      setProgress((prev) => ({
        ...prev,
        // Only update 'simulating' and 'progress' if they are present in the message
        ...(message["simulating"] && { simulating: message["simulating"] }),
        ...(message["progress"] && { progress: message["progress"] }),
        ...(message["patients"] && { patients: message["patients"] }),
        // Only update 'completed' if it's present, and append it to the existing array
        ...(message["completed"] && {
          completed: [...prev.completed, message["completed"]],
        }),
      }));
    };

    return () => {
      ws.close();
    };
  }, []);

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
          <SidebarItem icon={<UsersRound size={20} />} text="Patients" />
        </a>
        <a href="simulate-model">
          <SidebarItem
            icon={<BrainCircuit size={20} />}
            text="Model Simulation"
          />
        </a>
        <a href="upload">
          <SidebarItem icon={<Upload />} text="Upload & Run" active />
        </a>

        <SidebarItem icon={<Calendar size={20} />} text="Calendar" />
        <SidebarItem icon={<Layers size={20} />} text="Tasks" />

        {/* <hr className="my-3" />
        <SidebarItem icon={<Settings size={20} />} text="Settings" />
        <SidebarItem icon={<LifeBuoy size={20} />} text="Help" /> */}
      </Sidebar>
      <div className="flex flex-col h-full w-full items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div
          className={`flex w-1/2 ${
            isSimulating ? "h-1/2 items-center" : "h-fit"
          } justify-center max-w-5xl bg-white rounded-lg shadow dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700`}
        >
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {/* FILE UPLOAD SECTION */}
            {!isSimulating && !downloadReady && (
              <div className="flex items-center justify-center">
                {file ? (
                  <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="flex p-6 items-center">
                        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mr-8">
                          {file.name}
                        </p>
                        <button
                          onClick={() => {
                            setFile(null);
                          }}
                        >
                          <Trash2
                            size={22}
                            className="text-gray-700 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="text-gray-800 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        XLSX or CSV
                      </p>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        No file chosen
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        setFile(e.target.files[0]);
                      }}
                    />
                  </label>
                )}
              </div>
            )}

            {/* OPTIONS SECTION */}
            {!isSimulating && !downloadReady && (
              <div>
                <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">
                  Choose Option
                </h3>
                <ul className="grid w-full gap-6 md:grid-cols-3">
                  <li>
                    <input
                      type="checkbox"
                      id="option-1"
                      value=""
                      className="hidden peer"
                      onClick={() => handleOptionChange("option-1")}
                    />
                    <label
                      htmlFor="option-1"
                      className={`h-full text-center inline-flex items-center justify-between w-full p-5 text-gray-500 rounded-lg border-2 cursor-pointer ${
                        option === "option-1"
                          ? "bg-white dark:bg-gray-700 border-blue-600 dark:border-blue-600 dark:text-gray-300 text-gray-600"
                          : "bg-white dark:bg-gray-800 border-gray-200 hover:text-gray-600 dark:hover:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div>
                        <div className="flex h-1/4 justify-center">
                          <Infinity size={32} />
                        </div>

                        <div className="w-full text-lg font-semibold">
                          Fit & Simulate All
                        </div>
                        <div className="w-full text-sm">
                          {
                            "Fit the UVB efficacy and run the model simulation for each patient"
                          }
                        </div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <input
                      type="checkbox"
                      id="option-2"
                      value=""
                      className="hidden peer"
                      onClick={() => handleOptionChange("option-2")}
                    />
                    <label
                      htmlFor="option-2"
                      className={`h-full text-center inline-flex items-center justify-between w-full p-5 text-gray-500 rounded-lg border-2 cursor-pointer ${
                        option === "option-2"
                          ? "bg-white dark:bg-gray-700 border-blue-600 dark:border-blue-600 dark:text-gray-300 text-gray-600"
                          : "bg-white dark:bg-gray-800 border-gray-200 hover:text-gray-600 dark:hover:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div>
                        <div className="flex h-1/4 justify-center">
                          <Users size={32} />
                        </div>

                        <div className="w-full text-lg font-semibold">
                          Fit & Simulate Patients
                        </div>
                        <div className="w-full text-sm">
                          {
                            "Fit the UVB efficacy and run the model simulation for a specific group of patient"
                          }
                        </div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <input
                      type="checkbox"
                      id="option-3"
                      value=""
                      className="hidden peer"
                      onClick={() => handleOptionChange("option-3")}
                    />
                    <label
                      htmlFor="option-3"
                      className={`h-full text-center inline-flex items-center justify-between w-full p-5 text-gray-500 rounded-lg border-2 cursor-pointer ${
                        option === "option-3"
                          ? "bg-white dark:bg-gray-700 border-blue-600 dark:border-blue-600 dark:text-gray-300 text-gray-600"
                          : "bg-white dark:bg-gray-800 border-gray-200 hover:text-gray-600 dark:hover:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div>
                        <div className="flex h-1/4 justify-center">
                          <User size={32} />
                        </div>

                        <div className="w-full text-lg font-semibold">
                          Fit & Simulate Specific Patient
                        </div>
                        <div className="w-full text-sm">
                          {
                            "Fit the UVB efficacy and run the model simulation for a specific patient"
                          }
                        </div>
                      </div>
                    </label>
                  </li>
                </ul>
              </div>
            )}

            {/* LIVE SIMULATION UPDATE SECTION */}

            <div className="flex flex-col items-center">
              {/* HEADER OF UPDATE SECTION */}
              {isSimulating ? (
                <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  Simulating{" "}
                  <span className="font-normal text-gray-200">
                    {progress.progress}
                  </span>{" "}
                  Patients:
                </h2>
              ) : (
                downloadReady && (
                  <div>
                    <h2 className="mb-2 text-2xl text-center font-semibold text-gray-900 dark:text-white">
                      Download Ready
                    </h2>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-300">
                      <span className="font-normal text-gray-200">
                        {progress.progress}
                      </span>{" "}
                      Patients Simulated
                    </h2>
                  </div>
                )
              )}

              {/* PROGRESS UPDATER */}
              <div>
                <div className="flex flex-col mb-4 items-center">
                  {progress.patients.map((patient) => {
                    return (
                      <div className="flex items-center w-full">
                        <p className="mr-6 text-xl w-full font-medium text-gray-900 dark:text-white">
                          {patient}
                        </p>

                        {progress.completed.includes(patient) ? (
                          <div className="bg-green-400 rounded-full p-1 transition-all duration-300 ease-in-out">
                            <Check
                              className="justify-self-end"
                              size={8}
                              color="#1f2937"
                              strokeWidth={3}
                              absoluteStrokeWidth
                            />
                          </div>
                        ) : progress.simulating === patient ? (
                          <div className="rounded-full">
                            <svg
                              aria-hidden="true"
                              className="w-4 h-4 text-gray-700 animate-spin dark:text-gray-50 fill-gray-600"
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
                          </div>
                        ) : (
                          <div className="rounded-full p-1 transition-all duration-300 ease-in-out">
                            <Minus size={8} color="#f9fafb" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isSimulating &&
                    (progress.patients.length === 0 ||
                      progress.patients.length ===
                        progress.completed.length) && (
                      <div className="rounded-full transition-all duration-300 ease-in-out">
                        <svg
                          aria-hidden="true"
                          className="w-8 h-8 text-gray-700 animate-spin dark:text-gray-50 fill-gray-600 mt-6"
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
                      </div>
                    )}
                </div>
              </div>

              {/* BUTTON AREA */}
              {!isSimulating && (
                <div className="flex justify-center">
                  {downloadReady ? (
                    <div className="flex flex-col">
                      <button className="inline-flex items-center font-medium rounded-lg text-lg px-8 py-2.5 text-gray-50 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300">
                        <a
                          href={downloadUrl}
                          download={"Patient_Simulations.xlsx"}
                        >
                          <span className="font-normal text-gray-200 mr-4">
                            'Patient_Simulations.xlsx'
                          </span>
                        </a>
                        <FileDown color="#d1d5db" />
                      </button>

                      <button
                        onClick={clear}
                        className="rounded-lg mt-6 text-sm w-fit mx-auto px-6 py-1 text-white bg-blue-900 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-900 focus:ring-blue-300"
                      >
                        Clear
                      </button>
                    </div>
                  ) : file && option ? (
                    <button
                      onClick={handleSubmit}
                      className="inline-flex items-center font-medium rounded-lg text-lg px-16 py-2.5 text-gray-50 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center cursor-not-allowed font-medium rounded-lg text-lg px-16 py-2.5 text-gray-400 bg-blue-700 dark:bg-blue-700 focus:ring-blue-300"
                    >
                      Upload File and Select Option
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload_run;
