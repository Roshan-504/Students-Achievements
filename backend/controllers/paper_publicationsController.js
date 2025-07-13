import PaperPublication from '../models/paper_publicationsModel.js';

/**
 * @desc    Fetch all paper publications for the logged-in student
 * @route   GET /api/paper-publications
 * @access  Private (Student)
 */
export const getPaperPublications = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Exclude heavy binary data from being fetched
    const publications = await PaperPublication.find(
      { email_id: userEmail },
      { 'proof.data': 0 }
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
      date_of_publication
    } = req.body;

    const publicationData = {
      email_id: userEmail,
      paper_title,
      publication_name,
      issn_isbn,
      category,
      date_of_publication,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const newPublication = new PaperPublication(publicationData);
    const savedPublication = await newPublication.save();

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
      date_of_publication
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
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const updatedPublication = await PaperPublication.findByIdAndUpdate(
      publicationId,
      { $set: publicationData },
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
 * @desc    Download paper publication proof file
 * @route   GET /api/download/paper-publication/:id
 * @access  Private (Student)
 */
export const downloadPaperPublicationProof = async (req, res) => {
  try {
    const publication = await PaperPublication.findOne({ 
      _id: req.params.id, 
      email_id: req.user.email 
    });
    
    if (!publication || !publication.proof?.data) {
      return res.status(404).json({
        success: false,
        message: 'Proof file not found or you do not have permission to access it',
      });
    }

    res.set({
      'Content-Type': publication.proof.contentType,
      'Content-Disposition': `attachment; filename="${publication.proof.fileName}"`,
    });
    res.send(publication.proof.data);
  } catch (error) {
    console.error('Error downloading proof:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading proof',
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

    // Find and delete the publication, ensuring it belongs to the logged-in user
    const deletedPublication = await PaperPublication.findOneAndDelete({
      _id: publicationId,
      email_id: userEmail
    });
    
    if (!deletedPublication) {
      return res.status(404).json({
        success: false,
        message: 'Paper publication not found or unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Paper publication deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting paper publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting paper publication',
      error: error.message
    });
  }
};