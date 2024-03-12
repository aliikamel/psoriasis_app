import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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
        console.log(response.data)
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
    <div>
      <h1>{}</h1>
    </div>
  );
}

export default PatientDetails;
