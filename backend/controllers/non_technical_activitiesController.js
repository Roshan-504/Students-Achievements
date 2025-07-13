import NonTechnicalActivity from '../models/non_technical_activitiesModel.js';

/**
 * @desc    Fetch all non-technical activities for the logged-in student
 * @route   GET /api/non-technical-activities
 * @access  Private (Student)
 */
export const getNonTechnicalActivities = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Exclude heavy binary data from being fetched
    const activities = await NonTechnicalActivity.find(
      { email_id: userEmail },
      { 'proof.data': 0 }
    ).sort({ date: -1 }); // Sort by most recent first

    const incompleteActivities = activities.filter(activity =>
      !activity.proof?.fileName
    );

    const completeActivities = activities.filter(activity =>
      activity.proof?.fileName
    );

    res.status(200).json({
      success: true,
      data: {
        incomplete: incompleteActivities,
        complete: completeActivities
      },
      message: 'Non-technical activities fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching non-technical activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching non-technical activities',
      error: error.message 
    });
  }
};

/**
 * @desc    Upload new non-technical activity
 * @route   POST /api/upload/non-technical-activity
 * @access  Private (Student)
 */
export const uploadNonTechnicalActivity = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const {
      activity_name,
      institute,
      organizer,
      type,
      date,
      position
    } = req.body;

    const activityData = {
      email_id: userEmail,
      activity_name,
      institute,
      organizer,
      type,
      date,
      position,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const newActivity = new NonTechnicalActivity(activityData);
    const savedActivity = await newActivity.save();

    res.status(201).json({
      success: true,
      data: savedActivity,
      message: 'Non-technical activity added successfully',
    });
  } catch (error) {
    console.error('Error adding non-technical activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding non-technical activity',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing non-technical activity
 * @route   PUT /api/update/non-technical-activity/:id
 * @access  Private (Student)
 */
export const updateNonTechnicalActivity = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const activityId = req.params.id;
    const {
      activity_name,
      institute,
      organizer,
      type,
      date,
      position
    } = req.body;

    // Find activity and ensure it belongs to the user
    const activity = await NonTechnicalActivity.findOne({ 
      _id: activityId, 
      email_id: userEmail 
    });
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Non-technical activity not found or you do not have permission to update it',
      });
    }

    const activityData = {
      activity_name,
      institute,
      organizer,
      type,
      date,
      position,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const updatedActivity = await NonTechnicalActivity.findByIdAndUpdate(
      activityId,
      { $set: activityData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedActivity,
      message: 'Non-technical activity updated successfully',
    });
  } catch (error) {
    console.error('Error updating non-technical activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating non-technical activity',
      error: error.message,
    });
  }
};

/**
 * @desc    Download non-technical activity proof file
 * @route   GET /api/download/non-technical-activity/:id
 * @access  Private (Student)
 */
export const downloadNonTechnicalActivityProof = async (req, res) => {
  try {
    const activity = await NonTechnicalActivity.findOne({ 
      _id: req.params.id, 
      email_id: req.user.email 
    });
    
    if (!activity || !activity.proof?.data) {
      return res.status(404).json({
        success: false,
        message: 'Proof file not found or you do not have permission to access it',
      });
    }

    res.set({
      'Content-Type': activity.proof.contentType,
      'Content-Disposition': `attachment; filename="${activity.proof.fileName}"`,
    });
    res.send(activity.proof.data);
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
 * @desc    Delete a non-technical activity
 * @route   DELETE /api/non-technical-activity/:id
 * @access  Private (Student)
 */
export const deleteNonTechnicalActivity = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const activityId = req.params.id;

    // Find and delete the activity, ensuring it belongs to the logged-in user
    const deletedActivity = await NonTechnicalActivity.findOneAndDelete({
      _id: activityId,
      email_id: userEmail
    });
    
    if (!deletedActivity) {
      return res.status(404).json({
        success: false,
        message: 'Non-technical activity not found or unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Non-technical activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting non-technical activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting non-technical activity',
      error: error.message
    });
  }
};