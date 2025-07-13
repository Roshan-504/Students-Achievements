import TechnicalActivity from '../models/technical_activitiesModel.js';

/**
 * @desc    Fetch all technical activities for the logged-in student
 * @route   GET /api/technical-activities
 * @access  Private (Student)
 */
export const getTechnicalActivities = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Exclude heavy binary data from being fetched
    const activities = await TechnicalActivity.find(
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
      message: 'Technical activities fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching technical activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technical activities',
      error: error.message 
    });
  }
};

/**
 * @desc    Upload new technical activity
 * @route   POST /api/upload/technical-activity
 * @access  Private (Student)
 */
export const uploadTechnicalActivity = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const {
      activity_name,
      type,
      institute,
      organizer,
      date,
      position
    } = req.body;

    const activityData = {
      email_id: userEmail,
      activity_name,
      type,
      institute,
      organizer,
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

    const newActivity = new TechnicalActivity(activityData);
    const savedActivity = await newActivity.save();

    res.status(201).json({
      success: true,
      data: savedActivity,
      message: 'Technical activity added successfully',
    });
  } catch (error) {
    console.error('Error adding technical activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding technical activity',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing technical activity
 * @route   PUT /api/update/technical-activity/:id
 * @access  Private (Student)
 */
export const updateTechnicalActivity = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const activityId = req.params.id;
    const {
      activity_name,
      type,
      institute,
      organizer,
      date,
      position
    } = req.body;

    // Find activity and ensure it belongs to the user
    const activity = await TechnicalActivity.findOne({ 
      _id: activityId, 
      email_id: userEmail 
    });
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Technical activity not found or you do not have permission to update it',
      });
    }

    const activityData = {
      activity_name,
      type,
      institute,
      organizer,
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

    const updatedActivity = await TechnicalActivity.findByIdAndUpdate(
      activityId,
      { $set: activityData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedActivity,
      message: 'Technical activity updated successfully',
    });
  } catch (error) {
    console.error('Error updating technical activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating technical activity',
      error: error.message,
    });
  }
};

/**
 * @desc    Download technical activity proof file
 * @route   GET /api/download/technical-activity/:id
 * @access  Private (Student)
 */
export const downloadTechnicalActivityProof = async (req, res) => {
  try {
    const activity = await TechnicalActivity.findOne({ 
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
 * @desc    Delete a technical activity
 * @route   DELETE /api/technical-activity/:id
 * @access  Private (Student)
 */
export const deleteTechnicalActivity = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const activityId = req.params.id;

    // Find and delete the activity, ensuring it belongs to the logged-in user
    const deletedActivity = await TechnicalActivity.findOneAndDelete({
      _id: activityId,
      email_id: userEmail
    });
    
    if (!deletedActivity) {
      return res.status(404).json({
        success: false,
        message: 'Technical activity not found or unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Technical activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting technical activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting technical activity',
      error: error.message
    });
  }
};