const {
  createDepartment,
  getAllDepartents,
} = require("../controllers/department.contoller");

const express = require("express");
const { verifyIsAdmin, verifyToken } = require("../utils/verifyToken");

const departmentRoutes = express.Router();

departmentRoutes.post("/create", verifyToken, createDepartment);
departmentRoutes.get("/", getAllDepartents);
module.exports = departmentRoutes;
