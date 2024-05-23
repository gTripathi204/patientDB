const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const patientRoutes = require("./routes/patient.routes");
const departmentRoutes = require("./routes/deparment.routes");
const problemRoutes = require("./routes/problem.routes");
const ayenatiRoutes = require("./routes/ayenati.routes");
const cookieParser = require("cookie-parser");
const path = require("path");
const swaggerJsDocs = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const app = express();
/////////Swagger Implementation///////

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ayenati End Points",
      version: "1.0.0",
      description:
        "[http://18.204.141.1:8090/api/ayenati-inbound/hl7.json](http://18.204.141.1:8090/api/ayenati-inbound/hl7.json)",
        // "[http://localhost:8090/api/ayenati-inbound/hl7.json](http://localhost:8090/api/ayenati-inbound/hl7.json)",
    },
    // components: {
    //   securitySchemes: {
    //     bearerAuth: {
    //       type: "http",
    //       in: "header",
    //       description: "Enter Your Bearer Token ",
    //       name: "Authorization",
    //       scheme: "bearer",
    //       bearerFormat: "JWT",
    //     },
    //   },
    // },
    // security: [
    //   {
    //     bearerAuth: [],
    //   },
    // ],
    servers: [
      {
        url: "http://18.204.141.1:8090",
        // url: "http://localhost:8090",
        description: "Ayenati testing server",
      },
    ],
  },
  apis: ["./routes/ayenati.routes.js"],
};

const swaggerSpec = swaggerJsDocs(options);
app.use("/apis/ayenati-inbound", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Allow sending cookies and authentication headers
  })
);

app.use("/api/user", userRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/problem", problemRoutes);
app.use("/api/ayenati-inbound", ayenatiRoutes);

app.get("/api/ayenati-inbound/hl7.json", (req, res) => {
  const json = JSON.stringify(swaggerSpec, null, 2); // Convert JSON object to string with indentation
  res.send(json);
});

app.use("/", express.static(path.join(__dirname, "/build")));
app.get("/", function (req, res) {
  return res.sendFile(path.join(__dirname, "/build/index.html"));
});
app.get("/*", function (req, res) {
  return res.sendFile(path.join(__dirname, "/build/index.html"));
});

// app.get("/", (req, res) => {
//   res.send("Hello world");
// });

module.exports = app;
