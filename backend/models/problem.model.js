const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  problemName: [
    {
      name: {
        type: String,
      },
      type: {
        type: String,
      },
      inputType: {
        type: String,
      },
    },
  ],
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
});

module.exports = mongoose.model("Problem", problemSchema);
