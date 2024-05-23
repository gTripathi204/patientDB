const Problem = require("../models/problem.model");

const createProblem = async (req, res) => {
  try {
    const { name, type, inputType, department_id } = req.body;

    const existingProblem = await Problem.findOne({ department_id });

    if (existingProblem) {
      // Here problem type are of three types i.e. "problem","test","scale"
      // where test has two type sof inputTypes "text" , "file"
      existingProblem.problemName.push({ name, type, inputType });
      await existingProblem.save();
      return res.status(200).json({
        success: true,
        message: "Problem Updated successfully",
        data: existingProblem,
      });
    } else {
      const newProblem = await Problem.create({
        problemName: [{ name, type, inputType }],
        department_id,
      });
      return res.status(201).json({
        success: true,
        message: "Problem created successfully",
        data: newProblem,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getProblem = async (req, res) => {
  try {
    const problem = await Problem.find({
      department_id: req.params.id,
    });
    return res.status(200).json({
      success: true,
      message: "Problem found successfully",
      data: problem,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createProblem,
  getProblem,
};
