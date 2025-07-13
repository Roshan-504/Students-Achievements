const facultyLogSchema = new mongoose.Schema({
  faculty_email: { type: String, required: true },
  activity: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('faculty_logs', facultyLogSchema);