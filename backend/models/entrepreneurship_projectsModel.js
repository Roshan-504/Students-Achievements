import mongoose from 'mongoose';

const entrepreneurshipSchema = new mongoose.Schema({
  email_id: { 
    type: String, 
    required: true,
  },
  startup_name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Product-Based', 'Service-Based', 'Other']
  },
  registration_number: {
    type: String,
    trim: true
  },
  proof: {
    data: { type: Buffer },
    contentType: { type: String },
    fileName: { type: String }
  },
  
}, {
  timestamps: true,
});


const Entrepreneurship = mongoose.model('Entrepreneurship', entrepreneurshipSchema);
export default Entrepreneurship;