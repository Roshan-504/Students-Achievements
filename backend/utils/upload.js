import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|jpeg|jpg|png/;
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype) return cb(null, true);
    cb(new Error('File must be a PDF or image (jpeg, jpg, png)'));
  },
});

export default upload