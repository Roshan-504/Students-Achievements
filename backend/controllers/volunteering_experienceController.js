import Volunteering from '../models/volunteering_experienceModel.js';

/**
 * @desc    Fetch all volunteering activities for logged-in student
 * @route   GET /api/volunteering
 * @access  Private (Student)
 */
export const getVolunteerings = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Exclude binary proof data from initial fetch
    const volunteerings = await Volunteering.find(
      { email_id: userEmail },
      { 'proof.data': 0 }
    ).sort({ start_date: -1 });

    // Categorize by completion status
    const incomplete = volunteerings.filter(v => 
      !v.end_date || !v.proof?.fileName
    );
    const complete = volunteerings.filter(v => 
      v.end_date && v.proof?.fileName
    );

    res.status(200).json({
      success: true,
      data: { incomplete, complete },
      message: 'Volunteering activities fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching volunteerings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteering activities',
      error: error.message
    });
  }
};

/**
 * @desc    Upload new volunteering activity
 * @route   POST /api/volunteering/upload
 * @access  Private (Student)
 */
export const uploadVolunteering = async (req, res) => {
  try {
    const { 
      activity_name,
      organization,
      role,
      cause,
      start_date,
      end_date,
      hours_contributed,
      description
    } = req.body;

    const volunteeringData = {
      email_id: req.user.email,
      activity_name,
      organization,
      role,
      cause,
      start_date,
      end_date: end_date || null, // Handle empty end_date
      hours_contributed: hours_contributed || 0,
      description,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname
        }
      })
    };

    const newVolunteering = await Volunteering.create(volunteeringData);
    
    res.status(201).json({
      success: true,
      data: newVolunteering,
      message: 'Volunteering activity added successfully'
    });
  } catch (error) {
    console.error('Error adding volunteering:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding volunteering activity',
      error: error.message
    });
  }
};

/**
 * @desc    Update existing volunteering activity
 * @route   PUT /api/volunteering/update/:id
 * @access  Private (Student)
 */
export const updateVolunteering = async (req, res) => {
  try {
    const volunteeringId = req.params.id;
    const updateData = { ...req.body };

    // Handle file upload if present
    if (req.file) {
      updateData.proof = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname
      };
    }

    // Ensure the activity belongs to the user
    const updatedVolunteering = await Volunteering.findOneAndUpdate(
      { _id: volunteeringId, email_id: req.user.email },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedVolunteering) {
      return res.status(404).json({
        success: false,
        message: 'Volunteering activity not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedVolunteering,
      message: 'Volunteering activity updated successfully'
    });
  } catch (error) {
    console.error('Error updating volunteering:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating volunteering activity',
      error: error.message
    });
  }
};

/**
 * @desc    Download volunteering proof file
 * @route   GET /api/volunteering/download/:id
 * @access  Private (Student)
 */
export const downloadVolunteeringProof = async (req, res) => {
  try {
    const volunteering = await Volunteering.findOne({
      _id: req.params.id,
      email_id: req.user.email
    });

    if (!volunteering?.proof?.data) {
      return res.status(404).json({
        success: false,
        message: 'Proof not found or unauthorized'
      });
    }

    res.set({
      'Content-Type': volunteering.proof.contentType,
      'Content-Disposition': `attachment; filename="${volunteering.proof.fileName}"`
    });
    res.send(volunteering.proof.data);
  } catch (error) {
    console.error('Error downloading proof:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading proof',
      error: error.message
    });
  }
};

/**
 * @desc    Delete volunteering activity
 * @route   DELETE /api/volunteering/:id
 * @access  Private (Student)
 */
export const deleteVolunteering = async (req, res) => {
  try {
    const deleted = await Volunteering.findOneAndDelete({
      _id: req.params.id,
      email_id: req.user.email
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Volunteering activity not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Volunteering activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting volunteering:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting volunteering activity',
      error: error.message
    });
  }
};