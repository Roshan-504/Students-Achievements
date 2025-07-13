import mongoose from 'mongoose';

const paperPublicationSchema = new mongoose.Schema({
  email_id: { type: String, required: true },
  paper_title: String,
  publication_name: String,
  issn_isbn: String,
  category: String,
  date_of_publication: Date,
  proof: {
    data: { type: Buffer }, // Store file as binary
    contentType: { type: String }, // e.g., 'application/pdf'
    fileName: { type: String }, // Original file name
  },
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  });

const PaperPublication = mongoose.model('PaperPublication', paperPublicationSchema);
export default PaperPublication;