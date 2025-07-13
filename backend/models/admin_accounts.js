const adminAccountSchema = new mongoose.Schema({
  email_id: { type: String, required: true, unique: true },
  role: String,
  contact_no: String
});

module.exports = mongoose.model('admin_accounts', adminAccountSchema);
