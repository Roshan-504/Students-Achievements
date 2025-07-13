import mongoose from 'mongoose';
const courseCertificationSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  course_name: String,
  platform: String,
  start_date: Date,
  end_date: Date,
  course_type: String,
  proof: {
    data: { type: Buffer }, // Store file as binary
    contentType: { type: String }, // e.g., 'application/pdf'
    fileName: { type: String }, // Original file name
  },
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  });

const CourseCertification = mongoose.model('CourseCertification', courseCertificationSchema);
export default CourseCertification;