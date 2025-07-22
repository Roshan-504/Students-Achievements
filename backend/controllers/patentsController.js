// controllers/patentController.js
import Patent from '../models/patentsModel.js'; 
import student_profile from '../models/student_profileModel.js';

/**
 * @desc    Fetch all patents for the logged-in student
 * @route   GET /api/patents
 * @access  Private (Student)
 */
export const getPatents = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Exclude heavy binary data from being fetched
    const patents = await Patent.find(
      { email_id: userEmail },
      { 'proof.data': 0 }
    );

    const incompletePatents = patents.filter(patent =>
      !patent.proof?.fileName
    );

    const completePatents = patents.filter(patent =>
      patent.proof?.fileName
    );

    res.status(200).json({
      success: true,
      data: {
        incomplete: incompletePatents,
        complete: completePatents
      },
      message: 'Patents fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching patents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patents',
      error: error.message 
    });
  }
};

/**
 * @desc    Upload new patent data
 * @route   POST /api/upload/patent
 * @access  Private (Student)
 */
export const uploadPatent = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const {
      patent_name,
      application_no,
      application_date,
      user_type,
      inventor_name,
      description,
      co_inventors,
      status = 'Pending',
    } = req.body;

    const patentData = {
      email_id: userEmail,
      patent_name,
      application_no,
      application_date,
      user_type,
      inventor_name,
      description,
      co_inventors: JSON.parse(co_inventors || '[]'),
      status,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const newPatent = new Patent(patentData);
    const savedPatent = await newPatent.save();

    const updatedStudent = await student_profile.findOneAndUpdate(
      { email_id: userEmail },
      { $set: { last_updated: new Date() } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: savedPatent,
      message: 'Patent added successfully',
    });
  } catch (error) {
    console.error('Error adding patent:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding patent',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing patent
 * @route   PUT /api/patent/:id
 * @access  Private (Student)
 */
export const updatePatent = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const patentId = req.params.id;
    const {
      patent_name,
      application_no,
      application_date,
      user_type,
      inventor_name,
      description,
      co_inventors,
      status = 'Pending'
    } = req.body;

    // Find patent and ensure it belongs to the user
    const patent = await Patent.findOne({ _id: patentId, email_id: userEmail });
    if (!patent) {
      return res.status(404).json({
        success: false,
        message: 'Patent not found or you do not have permission to update it',
      });
    }

    const patentData = {
      patent_name,
      application_no,
      application_date,
      user_type,
      inventor_name,
      description,
      co_inventors: JSON.parse(co_inventors || '[]'),
      status,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const updatedPatent = await Patent.findByIdAndUpdate(
      patentId,
      { $set: patentData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPatent,
      message: 'Patent updated successfully',
    });
  } catch (error) {
    console.error('Error updating patent:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patent',
      error: error.message,
    });
  }
};

/**
 * @desc    Download patent document
 * @route   GET /api/download/patent/:id
 * @access  Private (Student)
 */
export const downloadPatentDocument = async (req, res) => {
  try {
    const patent = await Patent.findOne({ _id: req.params.id, email_id: req.user.email });
    if (!patent || !patent.proof?.data) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found or you do not have permission to access it',
      });
    }

    res.set({
      'Content-Type': patent.proof.contentType,
      'Content-Disposition': `attachment; filename="${patent.proof.fileName}"`,
    });
    res.send(patent.proof.data);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a patent
 * @route   DELETE /api/patent/:id
 * @access  Private (Student)
 */
export const deletePatent = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const patentId = req.params.id;
    
    const deletedPatent = await Patent.findOneAndDelete({
      _id: patentId,
      email_id: userEmail
    });
    
    if (!deletedPatent) {
      return res.status(404).json({
        success: false,
        message: 'Patent not found or unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Patent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patent:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patent',
      error: error.message
    });
  }
};