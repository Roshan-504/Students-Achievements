import mongoose from 'mongoose';
const otherAchievementSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  title: String,
  description: String,
  proof: {
    data: { type: Buffer },
    contentType: { type: String },
    fileName: { type: String }
  },
  
}, {
  timestamps: true,
});

otherAchievementSchema.index({ email_id: 1 });

const OtherAchievement = mongoose.model('OtherAchievement', otherAchievementSchema);
export default OtherAchievement;