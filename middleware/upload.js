const multer = require("multer");
const { storage } = require("../utils/cloudinary");

const upload = multer({
    storage,
    // size limit
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        // file type
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf"
        ];

        // if file type is in the allowedTypes then null-> no error, true-> add to cloudinary
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only images and PDF files are allowed"));
        }
    }
});

module.exports = upload;
