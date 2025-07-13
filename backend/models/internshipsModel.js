// models/Internship.js
import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  company_name: { type: String, required: true },
  internship_role: { type: String, required: true },
  department: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date }, // Allow "Ongoing" as string
  stipend: { type: String },
  external_mentor: { type: String },
  internal_mentor: { type: String },
  proof: {
    data: { type: Buffer }, // Store file as binary
    contentType: { type: String }, // e.g., 'application/pdf'
    fileName: { type: String }, // Original file name
  },
  },
  {
  timestamps: true // Adds createdAt and updatedAt fields
  });

const Internship = mongoose.model('Internship', internshipSchema);
export default Internship;
