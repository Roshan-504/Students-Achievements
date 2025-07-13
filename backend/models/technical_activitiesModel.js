import mongoose from 'mongoose';

const technicalActivitySchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  activity_name: String,
  type: String,
  institute: String,
  organizer: String,
  date: Date,
  position: String,
  proof: {
    data: { type: Buffer }, // Store file as binary
    contentType: { type: String }, // e.g., 'application/pdf'
    fileName: { type: String }, // Original file name
  },
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  });

const TechnicalActivity = mongoose.model('TechnicalActivity', technicalActivitySchema);
export default TechnicalActivity;