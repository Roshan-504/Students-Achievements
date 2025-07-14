const adminAccountSchema = new mongoose.Schema({
  email_id: { type: String, required: true, unique: true },
  role: String,
  contact_no: String
});

const admin_accounts = mongoose.model('admin_accounts', adminAccountSchema);

export default admin_accounts;