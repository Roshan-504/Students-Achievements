import mongoose from 'mongoose';

const entrepreneurshipSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  project_name: String,
  description: String,
  domain: String,
  year_of_start: Number,
  status: String,
  registration_proof_url: String
});

const EntrepreneurshipProject = mongoose.model('EntrepreneurshipProject', entrepreneurshipSchema);
export default EntrepreneurshipProject;
