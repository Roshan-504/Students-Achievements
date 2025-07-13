import OtherAchievement from '../models/other_achievementsModel.js';

/**
 * @desc    Fetch all other achievements for the logged-in student
 * @route   GET /api/other-achievements
 * @access  Private (Student)
 */
export const getOtherAchievements = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Exclude binary proof data from initial fetch
    const achievements = await OtherAchievement.find(
      { email_id: userEmail },
      { 'proof.data': 0 }
    ).sort({ createdAt: -1 });

    // Categorize by completion status
    const incomplete = achievements.filter(achievement => !achievement.proof?.fileName);
    const complete = achievements.filter(achievement => achievement.proof?.fileName);

    res.status(200).json({
      success: true,
      data: {
        incomplete,
        complete
      },
      message: 'Other achievements fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching other achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching other achievements',
      error: error.message
    });
  }
};

/**
 * @desc    Upload new other achievement
 * @route   POST /api/other-achievements/upload
 * @access  Private (Student)
 */
export const uploadOtherAchievement = async (req, res) => {
  try {
    const { title, description } = req.body;

    const achievementData = {
      email_id: req.user.email,
      title,
      description,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname
        }
      })
    };

    const newAchievement = await OtherAchievement.create(achievementData);
    
    res.status(201).json({
      success: true,
      data: newAchievement,
      message: 'Other achievement added successfully'
    });
  } catch (error) {
    console.error('Error adding other achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding other achievement',
      error: error.message
    });
  }
};

/**
 * @desc    Update existing other achievement
 * @route   PUT /api/other-achievements/update/:id
 * @access  Private (Student)
 */
export const updateOtherAchievement = async (req, res) => {
  try {
    const achievementId = req.params.id;
    const { title, description } = req.body;

    // Find achievement and ensure it belongs to the user
    const achievement = await OtherAchievement.findOne({ 
      _id: achievementId, 
      email_id: req.user.email 
    });
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found or unauthorized'
      });
    }

    const updateData = {
      title,
      description,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname
        }
      })
    };

    const updatedAchievement = await OtherAchievement.findByIdAndUpdate(
      achievementId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedAchievement,
      message: 'Other achievement updated successfully'
    });
  } catch (error) {
    console.error('Error updating other achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating other achievement',
      error: error.message
    });
  }
};

/**
 * @desc    Download other achievement proof file
 * @route   GET /api/other-achievements/download/:id
 * @access  Private (Student)
 */
export const downloadOtherAchievementProof = async (req, res) => {
  try {
    const achievement = await OtherAchievement.findOne({
      _id: req.params.id,
      email_id: req.user.email
    });

    if (!achievement?.proof?.data) {
      return res.status(404).json({
        success: false,
        message: 'Proof not found or unauthorized'
      });
    }

    res.set({
      'Content-Type': achievement.proof.contentType,
      'Content-Disposition': `attachment; filename="${achievement.proof.fileName}"`
    });
    res.send(achievement.proof.data);
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
 * @desc    Delete other achievement
 * @route   DELETE /api/other-achievements/:id
 * @access  Private (Student)
 */
export const deleteOtherAchievement = async (req, res) => {
  try {
    const deleted = await OtherAchievement.findOneAndDelete({
      _id: req.params.id,
      email_id: req.user.email
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Other achievement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting other achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting other achievement',
      error: error.message
    });
  }
};