// models/PersonalInfo.js
import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  email_id: { type: String, required: true, unique: true },
  prn: String,
  last_name: String,
  first_name: String,
  middle_name: String,
  mother_name: String,
  department: String,
  batch_no: Number,
  division: String,
  gender: String,
  abc_id: String,
  average_sgpi: Number,
  phone: String,
  linkedin_url: String,
  other_urls: [String],
  last_updated: Date
});

studentProfileSchema.index({ email_id: 1 });

const student_profile = mongoose.model('student_profile', studentProfileSchema);
export default student_profile;