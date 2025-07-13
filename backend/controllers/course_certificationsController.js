import CourseCertification from '../models/course_certificationsModel.js';

/**
 * @desc    Fetch all certifications for the logged-in student
 * @route   GET /api/certifications
 * @access  Private (Student)
 */
export const getCertifications = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Exclude heavy binary data from being fetched
    const certifications = await CourseCertification.find(
      { email_id: userEmail },
      { 'proof.data': 0 }
    );

    const incompleteCertifications = certifications.filter(certification =>
      certification.end_date === null || !certification.proof?.fileName
    );

    const completeCertifications = certifications.filter(certification =>
      certification.end_date !== null && certification.proof?.fileName
    );

    res.status(200).json({
      success: true,
      data: {
        incomplete: incompleteCertifications,
        complete: completeCertifications
      },
      message: 'Certifications fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certifications',
      error: error.message 
    });
  }
};

/**
 * @desc    Upload new certification data
 * @route   POST /api/upload/certification
 * @access  Private (Student)
 */
export const uploadCertification = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const {
      course_name,
      platform,
      start_date,
      end_date,
      course_type,
    } = req.body;

    const certificationData = {
      email_id: userEmail,
      course_name,
      platform,
      start_date,
      end_date,
      course_type,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const newCertification = new CourseCertification(certificationData);
    const savedCertification = await newCertification.save();

    res.status(201).json({
      success: true,
      data: savedCertification,
      message: 'Certification added successfully',
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding certification',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing certification
 * @route   PUT /api/update/certification/:id
 * @access  Private (Student)
 */
export const updateCertification = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const certificationId = req.params.id;
    const {
      course_name,
      platform,
      start_date,
      end_date,
      course_type,
    } = req.body;

    // Find certification and ensure it belongs to the user
    const certification = await CourseCertification.findOne({ 
      _id: certificationId, 
      email_id: userEmail 
    });
    
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found or you do not have permission to update it',
      });
    }

    const certificationData = {
      course_name,
      platform,
      start_date,
      end_date,
      course_type,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const updatedCertification = await CourseCertification.findByIdAndUpdate(
      certificationId,
      { $set: certificationData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCertification,
      message: 'Certification updated successfully',
    });
  } catch (error) {
    console.error('Error updating certification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating certification',
      error: error.message,
    });
  }
};

/**
 * @desc    Download certification proof file
 * @route   GET /api/download/certification/:id
 * @access  Private (Student)
 */
export const downloadCertificationProof = async (req, res) => {
  try {
    const certification = await CourseCertification.findOne({ 
      _id: req.params.id, 
      email_id: req.user.email 
    });
    
    if (!certification || !certification.proof?.data) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found or you do not have permission to access it',
      });
    }

    res.set({
      'Content-Type': certification.proof.contentType,
      'Content-Disposition': `attachment; filename="${certification.proof.fileName}"`,
    });
    res.send(certification.proof.data);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading certificate',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a certification
 * @route   DELETE /api/certification/:id
 * @access  Private (Student)
 */
export const deleteCertification = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const certificationId = req.params.id;

    // Find and delete the certification, ensuring it belongs to the logged-in user
    const deletedCertification = await CourseCertification.findOneAndDelete({
      _id: certificationId,
      email_id: userEmail
    });
    
    if (!deletedCertification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found or unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting certification',
      error: error.message
    });
  }
};