// models/patentModel.js
import mongoose from 'mongoose';

const patentSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  patent_name: { type: String},
  application_no: { type: String },
  application_date: { type: Date },
  user_type: { type: String },
  inventor_name: { type: String },
  description: { type: String },
  co_inventors: { type: [String], default: [] },
  status: { type: String, enum: ['Pending', 'Granted', 'Published', 'Filed'], default: 'Pending' },
  proof: {
    data: { type: Buffer },
    contentType: { type: String },
    fileName: { type: String },
  },
}, {
  timestamps: true
});

patentSchema.index({ email_id: 1 });

const Patent = mongoose.model('Patent', patentSchema);
export default Patent;