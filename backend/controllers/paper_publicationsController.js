import PaperPublication from '../models/paper_publicationsModel.js';
import student_profile from '../models/student_profileModel.js';

/**
 * @desc    Fetch all paper publications for the logged-in student
 * @route   GET /api/paper-publications
 * @access  Private (Student)
 */
export const getPaperPublications = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const publications = await PaperPublication.find(
      { email_id: userEmail }
    ).sort({ date_of_publication: -1 }); // Sort by most recent first

    const incompletePublications = publications.filter(pub =>
      !pub.proof?.fileName
    );

    const completePublications = publications.filter(pub =>
      pub.proof?.fileName
    );

    res.status(200).json({
      success: true,
      data: {
        incomplete: incompletePublications,
        complete: completePublications
      },
      message: 'Paper publications fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching paper publications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching paper publications',
      error: error.message 
    });
  }
};

/**
 * @desc    Upload new paper publication
 * @route   POST /api/upload/paper-publication
 * @access  Private (Student)
 */
export const uploadPaperPublication = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const {
      paper_title,
      publication_name,
      issn_isbn,
      category,
      date_of_publication,
      proof,
    } = req.body;

    const publicationData = {
      email_id: userEmail,
      paper_title,
      publication_name,
      issn_isbn,
      category,
      date_of_publication,
      ...(proof && {
        proof: {
          fileName: proof.fileName || proof // Handle both object and direct string
        }
      })
    };

    const newPublication = new PaperPublication(publicationData);
    const savedPublication = await newPublication.save();

    // Update student's last updated timestamp
    await student_profile.findOneAndUpdate(
      { email_id: userEmail },
      { $set: { last_updated: new Date() } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: savedPublication,
      message: 'Paper publication added successfully',
    });
  } catch (error) {
    console.error('Error adding paper publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding paper publication',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing paper publication
 * @route   PUT /api/update/paper-publication/:id
 * @access  Private (Student)
 */
export const updatePaperPublication = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const publicationId = req.params.id;
    const {
      paper_title,
      publication_name,
      issn_isbn,
      category,
      date_of_publication,
      proof,
    } = req.body;

    // Find publication and ensure it belongs to the user
    const publication = await PaperPublication.findOne({ 
      _id: publicationId, 
      email_id: userEmail 
    });
    
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Paper publication not found or you do not have permission to update it',
      });
    }

    const publicationData = {
      paper_title,
      publication_name,
      issn_isbn,
      category,
      date_of_publication,
      ...(proof && {
        proof: {
          fileName: proof.fileName || proof // Handle both object and direct string
        }
      })
    };

    const updatedPublication = await PaperPublication.findByIdAndUpdate(
      publicationId,
      { $set: publicationData },
      { new: true }
    );

    // Update student's last updated timestamp
    await student_profile.findOneAndUpdate(
      { email_id: userEmail },
      { $set: { last_updated: new Date() } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPublication,
      message: 'Paper publication updated successfully',
    });
  } catch (error) {
    console.error('Error updating paper publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating paper publication',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a paper publication
 * @route   DELETE /api/paper-publication/:id
 * @access  Private (Student)
 */
export const deletePaperPublication = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const publicationId = req.params.id;

    const publication = await PaperPublication.findOneAndDelete({ 
      _id: publicationId, 
      email_id: userEmail 
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Paper publication not found or you do not have permission to delete it',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Paper publication deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting paper publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting paper publication',
      error: error.message,
    });
  }
};