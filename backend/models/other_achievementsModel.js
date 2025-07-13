import mongoose from 'mongoose';
const otherAchievementSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  title: String,
  description: String,
  month: String,
  year: Number,
  category: String,
  certificate_url: String
});

const OtherAchievement = mongoose.model('OtherAchievement', otherAchievementSchema);
export default OtherAchievement;