const mongoose = require("mongoose");

const SettingSchema = mongoose.Schema({
  whatsappCloudApi: {
    type: String,
    default: "API",
  },
});

const SettingModel = mongoose.model("Setting", SettingSchema);
module.exports = SettingModel;
