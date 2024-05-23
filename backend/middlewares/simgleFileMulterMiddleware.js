const multer = require("multer");
const path = require("path");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname, "../public/reports"));
    },
    filename: function (req, file, cb) {
      const originalname = file.originalname;
      // Remove whitespace characters from the filename and replace them with underscores
      const sanitizedFilename = originalname.replace(/\s+/g, "_");
      cb(null, Date.now() + "_" + sanitizedFilename);
    },
  }),
  fileFilter: function (req, file, cb) {
    // Accept only image and pdf files
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
  },
});

module.exports = upload;
