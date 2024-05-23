const Patient = require("../models/patiend.model");
const ApiFeatures = require("../utils/apiFeatures");

const createPatient = async (req, res) => {
  try {
    const id = req.params.id;
    const isCrnExists = await Patient.findOne({
      crn: req.body.crn,
      doctor_id: id,
    });
    const isPhoneExists = await Patient.findOne({
      phone: req.body.phone,
      doctor_id: id,
    });
    if (isCrnExists) {
      return res.status(201).json({
        success: false,
        message: "Crn Already Exists",
      });
    }

    if (isPhoneExists) {
      return res.status(201).json({
        success: false,
        message: "phone Already Exists",
      });
    }

    const patient = await Patient.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Patient Created Successfully",
      data: patient,
    });
  } catch (error) {
    console.log(error);
  }
};

const updatePatient = async (req, res) => {
  try {
    // console.log(req.body);
    const { name, age, sex, crn, desc, doctor_id, nextApointmentDate } =
      req.body;
    const patientId = req.params.id;
    const newDiagnosisData = req.body.diagnosis;

    const patient = await Patient.findById(patientId);
    if (desc) patient.desc = desc;
    if (nextApointmentDate) patient.nextApointmentDate = nextApointmentDate;
    patient.diagnosis.push(...newDiagnosisData);

    const patientUpdate = await patient.save();

    return res.status(200).json({
      success: true,
      message: "Patient Updated Successfully",
      data: patientUpdate,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the patient.",
      error: error.message,
    });
  }
};

const searchPatient = async (req, res) => {
  try {
    const resultPerPage = 20;

    const searchKey = req.params.searchKey;
    const countPage = await Patient.countDocuments({
      doctor_id: req.user.id,
    });
    let pageCount = Math.ceil(countPage / resultPerPage);

    const apiFeatures = new ApiFeatures(
      Patient.find({
        doctor_id: req.user.id,
        $or: [
          { crn: { $regex: "^" + searchKey } },
          { phone: { $regex: "^" + searchKey } },
        ],
      }).populate("doctor_id"),
      req.query
    )
      .reverse()
      .pagination(resultPerPage);
    const result = await apiFeatures.query;

    if (result?.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (apiFeatures.getCurrentPage() > pageCount) {
      apiFeatures.setCurrentPage(pageCount);
      const updatedResult = await apiFeatures.pagination(resultPerPage).query;
      return res.status(200).json({
        success: true,
        message: "Patient Found Successfully",
        data: updatedResult,
        pageCount: pageCount,
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
      message: "Patient Found Successfully",
      pageCount: pageCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server Error" });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Patient Found Successfully",
      data: patient,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getPatientByDoctorCount = async (req, res) => {
  try {
    const countDocument = await Patient.countDocuments({
      doctor_id: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Patient Found Successfully",
      count: countDocument,
    });
  } catch (error) {
    console.log(error);
  }
};

const getPatientAppointment = async (req, res) => {
  try {
    let startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date();
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    startDate.setHours(0, 0, 0, 0);

    endDate.setHours(23, 59, 59, 999);

    const resultPerPage = 10 || req.query.resultPerPage;

    const countDocument = await Patient.countDocuments({
      nextApointmentDate: {
        $gte: startDate,
        $lte: endDate,
      },
      doctor_id: req.user.id,
    });
    let pageCount = Math.ceil(countDocument / resultPerPage);

    const apiFeatures = new ApiFeatures(
      Patient.find({
        nextApointmentDate: {
          $gte: startDate,
          $lte: endDate,
        },
        doctor_id: req.user.id,
      }),
      req.query
    )
      .reverse()
      .pagination(resultPerPage);
    const result = await apiFeatures.query;

    if (result?.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (apiFeatures.getCurrentPage() > pageCount) {
      apiFeatures.setCurrentPage(pageCount);
      const updatedResult = await apiFeatures.pagination(resultPerPage).query;
      return res.status(200).json({
        success: true,
        message: "Patient Found Successfully",
        data: updatedResult,
        pageCount: pageCount,
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
      message: "Patient Found Successfully",
      pageCount: pageCount,
      data: result,
      count: countDocument,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPatientByProblem = async (req, res) => {
  try {
    const { problem, doctor_id } = req.query;

    let startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date();
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    startDate.setHours(0, 0, 0, 0);

    endDate.setHours(23, 59, 59, 999);

    const resultPerPage = 10;

    const countDocument = await Patient.countDocuments({
      doctor_id: doctor_id,
      "diagnosis.diagnosData.problem": { $regex: problem },
    });
    let pageCount = Math.ceil(countDocument / resultPerPage);

    const apiFeatures = new ApiFeatures(
      Patient.find({
        doctor_id: doctor_id,
        "diagnosis.diagnosData.problem": problem,
        "diagnosis.date": {
          $gte: startDate,
          $lte: endDate,
        },
      }),
      req.query
    )
      .reverse()
      .pagination(resultPerPage);
    const result = await apiFeatures.query;

    if (result?.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (apiFeatures.getCurrentPage() > pageCount) {
      apiFeatures.setCurrentPage(pageCount);
      const updatedResult = await apiFeatures.pagination(resultPerPage).query;
      return res.status(200).json({
        success: true,
        message: "Patient Found Successfully",
        data: updatedResult,
        pageCount: pageCount,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient Found Successfully",
      pageCount: pageCount,
      data: result,
      count: countDocument,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPatientByMultipleProblem = async (req, res) => {
  try {
    const problems = req.body.problems;
    const { doctor_id } = req.query;
    let startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date();
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const resultPerPage = 10;

    const countDocument = await Patient.countDocuments({
      doctor_id: doctor_id,
      "diagnosis.diagnosData.problem": { $in: problems }, // Use direct array of problem strings
      "diagnosis.date": {
        $gte: startDate,
        $lte: endDate,
      },
    });

    let pageCount = Math.ceil(countDocument / resultPerPage);
    const apiFeatures = new ApiFeatures(
      Patient.find({
        doctor_id: doctor_id,
        "diagnosis.diagnosData.problem": { $in: problems }, // Use direct array of problem strings
        "diagnosis.date": {
          $gte: startDate,
          $lte: endDate,
        },
      }),
      req.query
    )
      .reverse()
      .pagination(resultPerPage);
    const result = await apiFeatures.query;
    if (result?.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }
    if (apiFeatures.getCurrentPage() > pageCount) {
      apiFeatures.setCurrentPage(pageCount);
      const updatedResult = await apiFeatures.pagination(resultPerPage).query;
      return res.status(200).json({
        success: true,
        message: "Patient Found Successfully",
        data: updatedResult,
        pageCount: pageCount,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Patient Found Successfully",
      pageCount: pageCount,
      data: result,
      count: countDocument,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createPatient,
  searchPatient,
  updatePatient,
  getPatientById,
  getPatientByDoctorCount,
  getPatientAppointment,
  getPatientByProblem,
  getPatientByMultipleProblem,
  // getPatient,
};
