import mongoose from 'mongoose';

const patentSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  patent_name: String,
  application_no: String,
  application_date: Date,
  user_type: String,
  inventor_name: String,
  description: String,
  co_inventors: [String],
  status: String,
  date: Date
});

const Patent = mongoose.model('Patent', patentSchema);
export default Patent;