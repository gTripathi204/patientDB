const mongoose = require("mongoose");

const smsLog = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  DateAndTime: Date,
});

module.exports = mongoose.model("SmsLog", smsLog);
