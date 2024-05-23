const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token =
    req?.cookies?.access_token || req?.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You are not authenticated",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired!! Please generate a new token",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Token is not valid",
        });
      }
    }

    req.user = user;

    next();
  });
};

const verifyUser = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "You are not authorized",
      });
    }
  });
};

const verifyIsAdmin = (req, res, next) => {
  const token =
    req.cookies.access_token || req?.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You are not authenticated",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid",
      });
    }
    req.user = user;
    if (user.userType === "admin") {
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "You are not Admin",
      });
    }
  });
};

module.exports = {
  verifyIsAdmin,
  verifyToken,
  verifyUser,
};
