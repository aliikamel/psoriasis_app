import React, { useState } from "react";
import axios from "axios";

function PasiUvbForm() {
  const [pasiWeeks, setPasiWeeks] = useState(
    Array(8)
      .fill("")
      .map((_, i) => ({ week: `PASI_END_WEEK_${i + 1}`, value: "" }))
  );
  const [uvbDoses, setUvbDoses] = useState(
    Array(16)
      .fill("")
      .map((_, i) => ({ dose: `UVB_DOSE_${i + 1}`, value: "" }))
  );

  const [pasiEndTreatment, setPasiEndTreatment] = useState("");
  const [pasiPreTreatment, setPasiPreTreatment] = useState("");

  const handlePasiChange = (index, value) => {
    const newPasiWeeks = [...pasiWeeks];
    newPasiWeeks[index].value = value;
    setPasiWeeks(newPasiWeeks);
  };

  const handleUvbChange = (index, value) => {
    const newUvbDoses = [...uvbDoses];
    newUvbDoses[index].value = value;
    setUvbDoses(newUvbDoses);
  };

  const addPasiWeek = () => {
    setPasiWeeks([
      ...pasiWeeks,
      { week: `PASI_END_WEEK_${pasiWeeks.length + 1}`, value: "" },
    ]);
  };

  const addUvbDose = () => {
    setUvbDoses([
      ...uvbDoses,
      { dose: `UVB_DOSE_${uvbDoses.length + 1}`, value: "" },
    ]);
  };

  const removePasiWeek = (index) => {
    const newPasiWeeks = pasiWeeks.filter((_, i) => i !== index);
    setPasiWeeks(newPasiWeeks);
  };

  const removeUvbDose = (index) => {
    const newUvbDoses = uvbDoses.filter((_, i) => i !== index);
    setUvbDoses(newUvbDoses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("PASI Weeks:", pasiWeeks);
    console.log("PASI End Treatment:", pasiEndTreatment);
    console.log("UVB Doses:", uvbDoses);

    // Prepare the data to be sent
    // Initialize an empty object for the formatted data
    let formattedData = {};

    // Add PASI end treatment data
    formattedData["PASI_PRE_TREATMENT"] = pasiPreTreatment || "";
    formattedData["PASI_END_TREATMENT"] = pasiEndTreatment || "";

    // Loop through PASI weeks and format keys/values
    pasiWeeks.forEach((week, index) => {
      const key = `PASI_END_WEEK_${index + 1}`; // Adjust index to start from 1
      formattedData[key] = week.value || ""; // Replace empty inputs with null
    });

    // Loop through UVB doses and format keys/values
    uvbDoses.forEach((dose, index) => {
      const key = `UVB_DOSE_${index + 1}`; // Adjust index to start from 1
      formattedData[key] = dose.value || ""; // Replace empty inputs with null
    });

    // Prepare data to be sent
    const cleanedFormData = JSON.stringify(formattedData);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/model/run-model/",
        cleanedFormData
      );
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("API Error:", error.response);
    }
  };

  const initialPasiCount = 8; //  initial count for PASI weeks
  const initialUvbCount = 16; //  initial count for UVB doses

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="flex w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-lg xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mt-4">
              <label
                htmlFor="pasiPreTreatment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-100 dark:text-gray-100"
              >
                PASI Pre-Treatment
              </label>
              <input
                type="number"
                id="pasiPreTreatment"
                value={pasiPreTreatment}
                onChange={(e) => setPasiPreTreatment(e.target.value)}
                className="mt-1 block w-80 rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
              />
            </div>
            {/* PASI Weeks Inputs */}
            <div className="grid grid-cols-4 gap-4">
              {pasiWeeks.map((week, index) => (
                <div key={index} className="relative space-y-2">
                  <label
                    htmlFor={week.week}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-100 dark:text-gray-100"
                  >
                    {`Week ${Number(index) + 1}`}
                  </label>
                  <input
                    type="number"
                    id={week.week}
                    value={week.value}
                    onChange={(e) => handlePasiChange(index, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
                  />
                  {index >= initialPasiCount && ( // Only render remove button for additional inputs
                    <button
                      type="button"
                      onClick={() => removePasiWeek(index)}
                      className="absolute top-0 right-0 mt-3 mr-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full h-6 w-6 flex items-center justify-center"
                    >
                      &times; {/* X symbol */}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPasiWeek}
              className="mt-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add PASI Week
            </button>
            {/* PASI_END_TREATMENT Input */}
            <div className="mt-4">
              <label
                htmlFor="pasiEndTreatment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-100"
              >
                PASI End of Treatment
              </label>
              <input
                type="number"
                id="pasiEndTreatment"
                value={pasiEndTreatment}
                onChange={(e) => setPasiEndTreatment(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            {/* UVB Doses Inputs */}
            <div className="grid grid-cols-4 gap-4">
              {uvbDoses.map((dose, index) => (
                <div key={index} className="relative space-y-2">
                  <label
                    htmlFor={dose.dose}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-100"
                  >
                    {`Dose ${Number(index) + 1}`}
                  </label>
                  <input
                    type="number"
                    id={dose.dose}
                    value={dose.value}
                    onChange={(e) => handleUvbChange(index, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {index >= initialUvbCount && ( // Only render remove button for additional inputs
                    <button
                      type="button"
                      onClick={() => removeUvbDose(index)}
                      className="absolute top-1/3 right-2 mt-3 mr-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full h-6 w-6 flex items-center justify-center"
                    >
                      &times; {/* X symbol */}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addUvbDose}
              className="mt-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add UVB Dose
            </button>
            <button
              type="submit"
              className="mt-4 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PasiUvbForm;
