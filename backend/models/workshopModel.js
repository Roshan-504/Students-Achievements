import mongoose from 'mongoose';

const workshopSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  title: { type: String, required: true },
  organizer: { type: String, required: true },
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  mode: { 
    type: String, 
    required: true,
    enum: ['Offline', 'Online', 'Hybrid'],
    default: 'Offline'
  },
  duration: { type: String, required: true },
  proof: {
    data: { type: Buffer },
    contentType: { type: String },
    fileName: { type: String }
  }
  }, 
  {
  timestamps: true
});


const Workshop = mongoose.model('Workshop', workshopSchema);

export default Workshop;