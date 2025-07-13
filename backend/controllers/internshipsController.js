import Internship from '../models/internshipsModel.js'; 
import multer from "multer"
/**
 * @desc    Fetch all internships for the logged-in student
 * @route   GET /api/internships
 * @access  Private (Student)
 */
export const getInternships = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Exclude heavy binary data from being fetched
    const internships = await Internship.find(
      { email_id: userEmail },
      { 'proof.data': 0 }
    );

    const incompleteInternships = internships.filter(internship =>
      internship.end_date === null || !internship.proof?.fileName
    );

    const completeInternships = internships.filter(internship =>
      internship.end_date !== null && internship.proof?.fileName
    );

    res.status(200).json({
      success: true,
      data: {
        incomplete: incompleteInternships,
        complete: completeInternships
      },
      message: 'Internships fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching internships',
      error: error.message 
    });
  }
};



/**
 * @desc    Upload new internship data
 * @route   POST /api/upload/internship
 * @access  Private (Student)
 */



// POST: Upload internship with certificate
export const uploadInternship = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const {
      company_name,
      internship_role,
      department,
      start_date,
      end_date,
      stipend,
      external_mentor,
      internal_mentor,
    } = req.body;

    const internshipData = {
      email_id: userEmail,
      company_name,
      internship_role,
      department,
      start_date,
      end_date,
      stipend,
      external_mentor,
      internal_mentor,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const newInternship = new Internship(internshipData);
    const savedInternship = await newInternship.save();

    res.status(201).json({
      success: true,
      data: savedInternship,
      message: 'Internship added successfully',
    });
  } catch (error) {
    console.error('Error adding internship:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding internship',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing internship
 * @route   PUT /api/internship/:id
 * @access  Private (Student)
 */
// PUT: Update existing internship
export const updateInternship = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const internshipId = req.params.id;
    const {
      company_name,
      internship_role,
      department,
      start_date,
      end_date,
      stipend,
      external_mentor,
      internal_mentor,
    } = req.body;

    // Find internship and ensure it belongs to the user
    const internship = await Internship.findOne({ _id: internshipId, email_id: userEmail });
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found or you do not have permission to update it',
      });
    }

    const internshipData = {
      company_name,
      internship_role,
      department,
      start_date,
      end_date,
      stipend,
      external_mentor,
      internal_mentor,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const updatedInternship = await Internship.findByIdAndUpdate(
      internshipId,
      { $set: internshipData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedInternship,
      message: 'Internship updated successfully',
    });
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating internship',
      error: error.message,
    });
  }
};


// GET: Download proof file
export const downloadInternshipProof = async (req, res) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, email_id: req.user.email });
    if (!internship || !internship.proof?.data) {
      return res.status(404).json({
        success: false,
        message: 'Proof file not found or you do not have permission to access it',
      });
    }

    res.set({
      'Content-Type': internship.proof.contentType,
      'Content-Disposition': `attachment; filename="${internship.proof.fileName}"`,
    });
    res.send(internship.proof.data);
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
 * @desc    Delete an internship
 * @route   DELETE /api/internship/:id
 * @access  Private (Student)
 */
export const deleteInternship = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const internshipId = req.params.id; // Get the internship ID from the URL parameters
        
        // Find and delete the internship, ensuring it belongs to the logged-in user
        const deletedInternship = await Internship.findOneAndDelete({
            _id: internshipId,
            email_id: userEmail
        });
        
        if (!deletedInternship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found or unauthorized'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Internship deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting internship:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting internship',
            error: error.message
        });
    }
};
