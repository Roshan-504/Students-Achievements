const facultyProfileSchema = new mongoose.Schema({
  email_id: { type: String, required: true, unique: true },
  name: String,
  department: String,
  designation: String,
  contact_no: String,
  assigned_batches: [String]
});

module.exports = mongoose.model('faculty_profiles', facultyProfileSchema);