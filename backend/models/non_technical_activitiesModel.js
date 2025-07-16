import mongoose from 'mongoose';

const nonTechnicalActivitySchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  activity_name: String,
  institute: String,
  organizer: String,
  type: String,
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

nonTechnicalActivitySchema.index({ email_id: 1 });

const NonTechnicalActivity = mongoose.model('NonTechnicalActivity', nonTechnicalActivitySchema);
export default NonTechnicalActivity;
