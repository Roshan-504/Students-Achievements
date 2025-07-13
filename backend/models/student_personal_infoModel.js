// models/PersonalInfo.js
import mongoose from 'mongoose';

const personalInfoSchema = new mongoose.Schema({
  email_id: { type: String, required: true, unique: true },
  prn: String,
  last_name: String,
  first_name: String,
  middle_name: String,
  mother_name: String,
  department: { type: String, default: "INFT" },
  batch_no: Number,
  class_division: String,
  gender: String,
  abc_id: String,
  current_sgpi: Number,
  phone: String,
  linkedin_url: String,
  other_urls: [String]
});

const PersonalInfo = mongoose.model('PersonalInfo', personalInfoSchema);
export default PersonalInfo;