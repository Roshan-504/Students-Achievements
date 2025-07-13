import mongoose from 'mongoose';

const volunteeringSchema = new mongoose.Schema({
  email_id: { 
    type: String, 
    required: true,
  },
  activity_name: { 
    type: String, 
    trim: true 
  },
  organization: { 
    type: String, 
    trim: true
  },
  role: { 
    type: String, 
    trim: true
  },
  cause: { 
    type: String, 
    trim: true
  },
  start_date: { 
    type: Date, 
  },
  end_date: { 
    type: Date,
  },
  hours_contributed: { 
    type: Number, 
    min: 0,
    default: 0 
  },
  description: { 
    type: String, 
    trim: true 
  },
  proof: {
    data: { type: Buffer }, // Binary file storage
    contentType: { type: String }, // MIME type (e.g., 'application/pdf')
    fileName: { type: String } // Original filename
  }
}, {
  timestamps: true, // Auto-add createdAt and updatedAt
});

const Volunteering = mongoose.model('Volunteering', volunteeringSchema);
export default Volunteering;