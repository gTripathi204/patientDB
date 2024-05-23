const User = require("../models/user.model");
const sendToken = require("../utils/sendToken");
const path = require("path");
const fs = require("fs");

const createUser = async (req, res) => {
  try {
    const isEmailExists = await User.findOne({ email: req.body.email });

    if (isEmailExists) {
      return res.status(404).json({
        success: false,
        message: "Email Already Exists",
      });
    }

    const user = await User.create(req.body);

    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select("+password")
      .populate("department_id");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email Not Found",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(404).json({
        success: false,
        message: "Password Not Matched",
      });
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.log(error);
  }
};

const isUserLogin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Please Login First",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Login Successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
  }
};

const userUpdate = async (req, res) => {
  try {
    // const updateUser = await User.findByIdAndUpdate(req.user.id, req.body, {
    //   new: true,
    // });
    // console.log(req.body);
    if (req.body.password) {
      if (req.body.password !== req.body.reEnterPassword) {
        return res.status(400).json({
          success: false,
          message: "Password and Re-Enter Password not matched",
        });
      }

      const user = await User.findById(req.user.id);
      user.password = req.body.password;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "User Updated Successfully",
        data: user,
      });
    }

    const user = await User.findById(req.user.id);
    user.name = req.body.name;
    // user.password = req.body.password;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const uploadPatientReport = (req, res) => {
  try {
    // Check if files exist in the request
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Process each uploaded file
    const filesInfo = req.files.map((file) => ({
      fileName: file.filename,
      filePath: file.path,
    }));

    return res
      .status(200)
      .json({ message: "Files uploaded successfully", filesInfo });
  } catch (error) {
    console.error("Error uploading files:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// const getPatientReport = (req, res) => {
//   try {
//     const { filename } = req.params;
//     const filePath = path.join(process.cwd(), "public", "reports", filename);

//     // Check if the file exists
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({
//         code: 404,
//         message: "File not found",
//       });
//     }

//     // Read the file content
//     const fileStream = fs.createReadStream(filePath);

//     // Set the appropriate content type for image files
//     res.setHeader("Content-Type", "image/png"); // Adjust content type based on file type

//     // Pipe the file content to the response
//     fileStream.pipe(res);
//   } catch (error) {
//     console.error("Error in path finding:", error);
//     return res.status(500).json({
//       code: 500,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };
const getPatientReport = (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), "public", "reports", filename);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        code: 404,
        message: "File not found",
      });
    }

    // Determine the file extension
    const extension = path.extname(filePath);
    let contentType = "application/octet-stream"; // Default content type

    // Set the appropriate content type based on file extension
    if (extension === ".png") {
      contentType = "image/png";
    } else if (extension === ".jpg" || extension === ".jpeg") {
      contentType = "image/jpeg";
    } else if (extension === ".gif") {
      contentType = "image/gif";
    } else if (extension === ".pdf") {
      contentType = "application/pdf";
    }

    // Read the file content
    const fileStream = fs.createReadStream(filePath);

    // Set the appropriate content type for the file
    res.setHeader("Content-Type", contentType);

    // Pipe the file content to the response
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error in path finding:", error);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const togglePatientNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Toggle the patientNotification field
    const newNotificationValue = !user.patientNotification;

    // Update the user's patientNotification field
    const response = await User.updateOne(
      { _id: req.user.id }, // Filter by _id
      { $set: { patientNotification: newNotificationValue } } // Toggle the patientNotification field
    );

    if (response.nModified === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient notification not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient notification toggled successfully",
      data: newNotificationValue,
    });
  } catch (error) {
    console.error("Error toggling patient notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  userUpdate,
  uploadPatientReport,
  getPatientReport,
  togglePatientNotifications,
  isUserLogin,
};
