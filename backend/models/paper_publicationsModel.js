import mongoose from 'mongoose';

const paperPublicationSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  paper_title: String,
  publication_name: String,
  issn_isbn: String,
  category: String,
  date_of_publication: Date,
  proof: {
    fileName: { type: String }, // URL In this case
  },
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  });

paperPublicationSchema.index({ email_id: 1 });

const PaperPublication = mongoose.model('PaperPublication', paperPublicationSchema);
export default PaperPublication;