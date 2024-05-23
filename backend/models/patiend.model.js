const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    age: {
      type: Number,
    },
    sex: {
      type: String,
    },
    crn: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // desc: {
    //   type: String,
    // },
    nextApointmentDate: {
      type: Date,
    },
    diagnosis: [
      {
        diagnosData: [
          {
            problem: String,
            subProblem: String,
            test: [],
            scale: [],
            // test: String,
            // testInput: String,
            // files: [],
            // // files:[],
            // scale: String,
            // value: String,
          },
        ],
        procedure: [],
        date: Date,
        desc: String,
      },
    ],
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    // diagnosis: [
    //   {
    //     problem: [
    //       { name: String, scale1: String, scale2: String, scale3: String },
    //     ],
    //     date: Date,
    //     desc: String,
    //   },
    // ],
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
