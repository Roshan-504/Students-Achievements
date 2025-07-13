import mongoose from 'mongoose';

const featuredSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  feature_name: String,
  date: Date,
  topic: String,
  cause: String,
  link: String
});

const Featured = mongoose.model('Featured', featuredSchema);
export default Featured;
