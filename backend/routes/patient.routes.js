const express = require("express");
const {
  createPatient,
  searchPatient,
  updatePatient,
  getPatientById,
  getPatient,
  getPatientByDoctor,
  getPatientAppointment,
  getPatientByDoctorCount,
  getPatientByProblem,
  getPatientAppointmentRange,
  getPatientByMultipleProblem,
} = require("../controllers/patient.controller");
const { verifyToken } = require("../utils/verifyToken");

const patientRoutes = express.Router();

patientRoutes.post("/create/:id", verifyToken, createPatient);
patientRoutes.get("/problems", verifyToken, getPatientByProblem);
patientRoutes.post(
  "/multipleProblems",
  verifyToken,
  getPatientByMultipleProblem
);
// patientRoutes.get("/doc/:doc_id", verifyToken,getPatientByDoctor);
patientRoutes.get("/nextAppointmentDate", verifyToken, getPatientAppointment);
patientRoutes.get("/patientByDoctor", verifyToken, getPatientByDoctorCount);
// patientRoutes.get("/:searchKey/:doctor_id", verifyToken,searchPatient);
patientRoutes.get("/:searchKey", verifyToken, searchPatient);
patientRoutes.put("/update/:id", verifyToken, updatePatient);
patientRoutes.get("/", verifyToken, getPatientById);
// patientRoutes.get("/", getPatient);
module.exports = patientRoutes;
