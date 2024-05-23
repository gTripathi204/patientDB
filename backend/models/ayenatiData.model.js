const mongoose = require("mongoose");

const AyenatiResponseSchema = new mongoose.Schema(
  {
    ayenatiData: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ayenati-response", AyenatiResponseSchema);
