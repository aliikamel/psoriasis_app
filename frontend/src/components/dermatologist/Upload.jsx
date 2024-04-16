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
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Tooltip } from "flowbite-react";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [filePatients, setFilePatients] = useState(null);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [includeActualPasi, setIncludeActualPasi] = useState(false);
  const [actualPasiColumn, setActualPasiColumn] = useState("");
  const [unscalePasi, setUnscalePasi] = useState(false);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    handleNext();
  };

  const handleNext = async () => {
    const formData = new FormData();
    formData.append("file", file); // must match key that backend expects
    formData.append("all_patients", Number(0));

    try {
      const response = await axios.post(
        "http://localhost:8000/api/model/simulate-file/",
        formData, // Send formData instead of raw file
        {
          headers: {
            "Content-Type": "multipart/form-data", // This header tells the server to expect form data
          },
        }
      );
      const data = response.data;
      let patients = data["patients"];
      patients = patients.map((patient) => Number(patient));
      setFilePatients(patients);
    } catch (error) {
      console.error("API Error:", error.response);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOptionChange = (selected_option) => {
    if (selected_option === option) {
      setOption(null);
    } else {
      setOption(selected_option);
    }
  };

  const selectPatient = (patient) => {
    if (selectedPatients.includes(patient)) {
      // Filter out the patient from the array
      const filteredPatients = selectedPatients.filter((p) => p !== patient);
      setSelectedPatients([...filteredPatients]);
    } else {
      // Add the patient to the array
      setSelectedPatients([...selectedPatients, Number(patient)]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPatients.length === filePatients.length) {
      // All are selected, so clear selection
      setSelectedPatients([]);
    } else {
      // Not all are selected, so select all
      setSelectedPatients([...filePatients]);
    }
  };

  const clear = () => {
    setCurrentStep(1);
    setFilePatients(null);
    setSelectedPatients([]);
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
    const formData = new FormData();
    formData.append("file", file); // must match key that backend expects
    formData.append("all_patients", Number(1)); // Send as a Number value

    if (option !== "option-1") {
      formData.append("selected_patients", JSON.stringify(selectedPatients));
    }

    if (includeActualPasi) {
      formData.append("actual_pasi_column", actualPasiColumn);
    }

    if (unscalePasi) {
      formData.append("unscale_pasi", Number(1));
    }

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
      </Sidebar>
      <div className="flex flex-col h-full w-full items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="flex flex-col w-1/2 h-fit items-center justify-center	 max-w-5xl bg-white rounded-lg shadow dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          {/* STEPPER */}
          <div className="w-full px-22 py-6">
            <div
              className={`grid items-center gap-3 grid-cols-${
                option === "option-2" ? 5 : 4
              }`}
            >
              <div className="flex items-center justify-center">
                {file && (
                  <div className="bg-blue-600 mr-2 rounded-full p-1 transition-all duration-300 ease-in-out">
                    <Check
                      className="justify-self-end"
                      size={6}
                      color="#1f2937"
                      strokeWidth={3}
                      absoluteStrokeWidth
                    />
                  </div>
                )}
                <p
                  className={`inline-flex text-center text-sm font-medium text-center sm:text-base transition-all duration-300 ease-in-out	${
                    file
                      ? "dark:text-blue-500 text-blue-600"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Upload File
                </p>
              </div>

              <div
                className={`h-[2px] transition-all duration-300 ease-in-out col-span-${
                  option !== "option-2" ? 2 : 1
                } ${
                  file && option
                    ? "dark:bg-blue-500 bg-blue-600"
                    : "dark:bg-gray-600 dark:border-gray-200"
                }`}
              />

              <div className="flex items-center justify-center">
                {option && (
                  <div className="bg-blue-600 mr-2 rounded-full p-1 transition-all duration-300 ease-in-out">
                    <Check
                      className="justify-self-end"
                      size={6}
                      color="#1f2937"
                      strokeWidth={3}
                      absoluteStrokeWidth
                    />
                  </div>
                )}
                <p
                  className={`inline-flex text-center text-sm font-medium text-center sm:text-base transition-all duration-300 ease-in-out	${
                    option
                      ? "dark:text-blue-500 text-blue-600"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Select Option
                </p>
              </div>

              {option === "option-2" && (
                <>
                  <div
                    className={`h-[2px] dark:bg-gray-600 dark:border-gray-200`}
                  />
                  <div className="w-full flex items-center justify-center">
                    {selectedPatients.length > 0 && (
                      <div className="bg-blue-600 mr-2 rounded-full p-1 transition-all duration-300 ease-in-out">
                        <Check
                          className="justify-self-end"
                          size={6}
                          color="#1f2937"
                          strokeWidth={3}
                          absoluteStrokeWidth
                        />
                      </div>
                    )}
                    <p
                      className={`inline-flex text-center text-sm font-medium text-center sm:text-base transition-all duration-300 ease-in-out	${
                        selectedPatients.length > 0
                          ? "dark:text-blue-500 text-blue-600"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Select Patients
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* FIRST PAGE */}
          {currentStep === 1 && (
            <div
              className={`flex ${
                isSimulating ? "items-center" : "h-fit"
              } justify-center transition-all duration-500 ease-in-out`}
            >
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                {/* FILE UPLOAD SECTION */}
                {!isSimulating && !downloadReady && (
                  <div className="flex items-center justify-center">
                    {file ? (
                      <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="flex p-6 items-center">
                            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mr-8">
                              {file.name}
                            </p>
                            <button onClick={clear}>
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
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
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
                    <div>
                      <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">
                        Choose Option
                      </h3>
                      <ul className="grid w-full gap-6 md:grid-cols-2">
                        <li>
                          <input
                            disabled={file ? false : true}
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
                            disabled={file ? false : true}
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
                                  "Fit the UVB efficacy and run the model simulation for a specific selection of patients"
                                }
                              </div>
                            </div>
                          </label>
                        </li>
                      </ul>
                    </div>
                    {file && option && (
                      <div className="flex flex-col items-center justify-center mt-6">
                        <div className="flex flex-col">
                          <Tooltip
                            content="The simulated PASI is min-max scaled, select this option to scale back to normal"
                            animation="duration-300"
                          >
                            <label
                              data-tooltip-target="tooltip-default"
                              class="inline-flex items-center cursor-pointer mb-2"
                            >
                              <input
                                onClick={() => setUnscalePasi(!unscalePasi)}
                                type="checkbox"
                                class="sr-only peer"
                                checked={unscalePasi}
                              />
                              <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Unscale Simulated PASI
                              </span>
                            </label>
                          </Tooltip>
                          <label class="inline-flex items-center cursor-pointer">
                            <input
                              onClick={() =>
                                setIncludeActualPasi(!includeActualPasi)
                              }
                              type="checkbox"
                              class="sr-only peer"
                              checked={includeActualPasi}
                            />
                            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                              Include Actual PASI Column
                            </span>
                          </label>
                        </div>

                        {includeActualPasi && (
                          <div className="flex w-fit flex-col mt-4 max-w-72">
                            <label
                              for="first_name"
                              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Set Column Name
                            </label>
                            <input
                              type="text"
                              id="first_name"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder='e.g. "ACTUAL_PASI"'
                              required
                              autocomplete="off"
                              value={actualPasiColumn}
                              onChange={(e) => {
                                const trimmedValue = e.target.value.trim();
                                // Only update the state if the trimmed value is not empty
                                if (trimmedValue || e.target.value === "") {
                                  setActualPasiColumn(e.target.value);
                                }
                              }}
                            />
                            {actualPasiColumn === "" ? (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Set the name of the column to for Actual PASI in
                                the file
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Column name in file will be "
                                <span className="text-gray-700 dark:text-gray-200">
                                  {actualPasiColumn.trim()}
                                </span>
                                "
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* LIVE SIMULATION UPDATE SECTION */}

                {(isSimulating || downloadReady) && (
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECOND PAGE */}
          {currentStep === 2 && (
            <div class="flex h-fit justify-center transition-all duration-500 ease-in-out w-full">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8 w-full">
                {!isSimulating && !downloadReady && (
                  <>
                    <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">
                      Select Patients
                    </h3>
                    {filePatients ? (
                      <div className="max-h-96 overflow-y-auto w-full rounded-lg">
                        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th scope="col" class="p-4">
                                <div class="flex items-center">
                                  <input
                                    id="checkbox-all"
                                    type="checkbox"
                                    onClick={toggleSelectAll}
                                    checked={
                                      selectedPatients.length ===
                                      filePatients.length
                                    }
                                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <label for="checkbox-all" class="sr-only">
                                    checkbox
                                  </label>
                                </div>
                              </th>
                              <th scope="col" class="px-6 py-3">
                                Patient
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filePatients.map((patient) => {
                              return (
                                <tr
                                  key={`patient-${patient}`}
                                  class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                  <td class="w-4 p-4">
                                    <div class="flex items-center">
                                      <input
                                        id={`checkbox-patient-${patient}`}
                                        type="checkbox"
                                        onClick={() => selectPatient(patient)}
                                        checked={selectedPatients.includes(
                                          Number(patient)
                                        )}
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                      />
                                      <label
                                        for="checkbox-table-1"
                                        class="sr-only"
                                      >
                                        checkbox
                                      </label>
                                    </div>
                                  </td>
                                  <th
                                    scope="row"
                                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                  >
                                    {`Patient ${patient}`}
                                  </th>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
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
                  </>
                )}
                {(isSimulating || downloadReady) && (
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BUTTON AREA */}
          {option && (
            <div className="flex justify-center p-6">
              <div className="flex flex-col">
                {!isSimulating && option === "option-1" ? (
                  /* BUTTONS FOR OPTION 2 */
                  downloadReady ? (
                    <>
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
                    </>
                  ) : includeActualPasi ? (
                    actualPasiColumn === "" ? (
                      <button
                        disabled
                        className={`inline-flex items-center font-medium rounded-lg text-lg px-16 py-2.5 text-gray-400 bg-blue-900 dark:bg-blue-900`}
                      >
                        Simulate
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className={`inline-flex items-center font-medium rounded-lg text-lg px-16 py-2.5 text-gray-50 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300`}
                      >
                        Simulate
                      </button>
                    )
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className={`inline-flex items-center font-medium rounded-lg text-lg px-16 py-2.5 text-gray-50 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300`}
                    >
                      Simulate
                    </button>
                  )
                ) : (
                  !isSimulating &&
                  /* BUTTONS FOR OPTION 2 */
                  (downloadReady ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      {currentStep === 2 && (
                        <>
                          <button
                            onClick={handleSubmit}
                            disabled={selectedPatients.length === 0}
                            className={`inline-flex items-center font-medium rounded-lg text-lg px-16 py-2.5 ${
                              selectedPatients.length > 0
                                ? "text-gray-50 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-300"
                                : "text-gray-400 bg-blue-800 dark:bg-blue-800 focus:ring-blue-300"
                            } `}
                          >
                            Simulate
                          </button>

                          <button
                            onClick={prevStep}
                            className="rounded-full mt-6 text-sm w-fit mx-auto px-4 py-1 text-white bg-blue-900 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-900 focus:ring-blue-300"
                          >
                            <ArrowLeft strokeWidth={3} />
                          </button>
                        </>
                      )}

                      {currentStep === 1 && (
                        <button
                          onClick={nextStep}
                          className={`inline-flex justify-center font-medium rounded-lg text-lg px-12 py-2 focus:ring-blue-300 col-span-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-gray-50`}
                        >
                          Next
                        </button>
                      )}
                    </>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Upload_run;
