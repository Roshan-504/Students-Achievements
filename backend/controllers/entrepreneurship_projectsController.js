import Entrepreneurship from '../models/entrepreneurship_projectsModel.js';

/**
 * @desc    Fetch all entrepreneurship records for the logged-in student
 * @route   GET /api/entrepreneurship
 * @access  Private (Student)
 */
export const getEntrepreneurships = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Exclude heavy binary data from being fetched
    const records = await Entrepreneurship.find(
      { email_id: userEmail },
      { 'proof.data': 0 }
    )
    
    const incompleteRecords = records.filter(record =>
      !record.proof?.fileName
    );

    const completeRecords = records.filter(record =>
      record.proof?.fileName
    );

    res.status(200).json({
      success: true,
      data: {
        incomplete: incompleteRecords,
        complete: completeRecords
      },
      message: 'Entrepreneurship records fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching entrepreneurship records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching entrepreneurship records',
      error: error.message 
    });
  }
};

/**
 * @desc    Upload new entrepreneurship record
 * @route   POST /api/upload/entrepreneurship
 * @access  Private (Student)
 */
export const uploadEntrepreneurship = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const {
      startup_name,
      role,
      description,
      type,
      registration_number
    } = req.body;

    const entrepreneurshipData = {
      email_id: userEmail,
      startup_name,
      role,
      description,
      type,
      registration_number,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const newRecord = new Entrepreneurship(entrepreneurshipData);
    const savedRecord = await newRecord.save();

    res.status(201).json({
      success: true,
      data: savedRecord,
      message: 'Entrepreneurship record added successfully',
    });
  } catch (error) {
    console.error('Error adding entrepreneurship record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding entrepreneurship record',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing entrepreneurship record
 * @route   PUT /api/update/entrepreneurship/:id
 * @access  Private (Student)
 */
export const updateEntrepreneurship = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const recordId = req.params.id;
    const {
      startup_name,
      role,
      description,
      type,
      registration_number
    } = req.body;

    // Find record and ensure it belongs to the user
    const record = await Entrepreneurship.findOne({ 
      _id: recordId, 
      email_id: userEmail 
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Entrepreneurship record not found or you do not have permission to update it',
      });
    }

    const recordData = {
      startup_name,
      role,
      description,
      type,
      registration_number,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const updatedRecord = await Entrepreneurship.findByIdAndUpdate(
      recordId,
      { $set: recordData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedRecord,
      message: 'Entrepreneurship record updated successfully',
    });
  } catch (error) {
    console.error('Error updating entrepreneurship record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating entrepreneurship record',
      error: error.message,
    });
  }
};

/**
 * @desc    Download entrepreneurship proof file
 * @route   GET /api/download/entrepreneurship/:id
 * @access  Private (Student)
 */
export const downloadEntrepreneurshipProof = async (req, res) => {
  try {
    const record = await Entrepreneurship.findOne({ 
      _id: req.params.id, 
      email_id: req.user.email 
    });
    
    if (!record || !record.proof?.data) {
      return res.status(404).json({
        success: false,
        message: 'Proof file not found or you do not have permission to access it',
      });
    }

    res.set({
      'Content-Type': record.proof.contentType,
      'Content-Disposition': `attachment; filename="${record.proof.fileName}"`,
    });
    res.send(record.proof.data);
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
 * @desc    Delete an entrepreneurship record
 * @route   DELETE /api/entrepreneurship/:id
 * @access  Private (Student)
 */
export const deleteEntrepreneurship = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const recordId = req.params.id;

    // Find and delete the record, ensuring it belongs to the logged-in user
    const deletedRecord = await Entrepreneurship.findOneAndDelete({
      _id: recordId,
      email_id: userEmail
    });
    
    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Entrepreneurship record not found or unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Entrepreneurship record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting entrepreneurship record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting entrepreneurship record',
      error: error.message
    });
  }
};