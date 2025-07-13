const accessLogSchema = new mongoose.Schema({
  admin_email: { type: String, required: true },
  action: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('access_logs', accessLogSchema);