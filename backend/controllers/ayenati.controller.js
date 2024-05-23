const ayenatiDataModel = require("../models/ayenatiData.model");
const ayenatiUser = require("../models/ayenatiUser.model");

const generateToken = async (req, res) => {
  try {
    // const authHeader = req.headers.authorization;
    // if (!authHeader || !authHeader.startsWith("Basic ")) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Unauthorized: Basic authentication header missing",
    //   });
    // }

    // const credentialsBase64 = authHeader.split(" ")[1];
    // const credentials = Buffer.from(credentialsBase64, "base64").toString(
    //   "utf-8"
    // );
    // const [username, password] = credentials.split(":");
    const { username, password } = req.body;

    const findUser = await ayenatiUser
      .findOne({ username })
      .select("+password");

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "Email Not Found",
      });
    }

    const isPasswordMatched = await findUser.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(404).json({
        success: false,
        message: "Password Not Matched",
      });
    }
    const token = await findUser.getToken();

    res.json({
      token: token,
      user: username,
      generatedAt: Date(),
      expiresIn: "24 hours",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const createData = async (req, res) => {
  try {
    let bodyData = req.body;
    const ayenatiData = await ayenatiDataModel.create({
      ayenatiData: bodyData,
    });

    return res.status(200).json({
      success: true,
      message: "HL7 message is created and stored in database",
      data: ayenatiData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getData = async (req, res) => {
  try {
    const data = await ayenatiDataModel.find();
    const reverseData = data.reverse();
    return res.status(200).json({
      success: true,
      data: reverseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const createUserAPIController = async (req, res) => {
  try {
    const { username, password } = req.body;
    const createuser = await ayenatiUser.create({
      username: username,
      password: password,
    });
    if (createuser) {
      return res.status(200).json({
        success: true,
        message: "User created Successfully",
        data: createuser,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

module.exports = {
  createData,
  getData,
  generateToken,
  createUserAPIController,
};
