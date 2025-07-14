import mongoose from "mongoose";

const facultyProfileSchema = new mongoose.Schema({
  email_id: { type: String, required: true, unique: true },
  name: String,
  department: String,
  designation: String,
  contact_no: String,
  assigned_batches: [String]
});

const faculty_profiles = mongoose.model('faculty_profiles', facultyProfileSchema);

export default faculty_profiles;