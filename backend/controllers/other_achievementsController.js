import OtherAchievement from '../models/other_achievementsModel.js'; 

/**
 * @desc    Fetch all other achievements for the logged-in student
 * @route   GET /api/other-achievements
 * @access  Private (Student)
 */
export const getOtherAchievements = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const otherAchievements = await OtherAchievement.find({ email_id: userEmail });
        
        res.status(200).json({
            success: true,
            data: otherAchievements,
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
 * @desc    Upload new other achievement data
 * @route   POST /api/upload/other-achievement
 * @access  Private (Student)
 */
export const uploadOtherAchievement = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        const achievementData = {
            ...req.body,
            email_id: userEmail
        };
        
        const newAchievement = new OtherAchievement(achievementData);
        const savedAchievement = await newAchievement.save();
        
        res.status(201).json({
            success: true,
            data: savedAchievement,
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
 * @route   PUT /api/other-achievement/:id
 * @access  Private (Student)
 */
export const updateOtherAchievement = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const achievementId = req.params.id; 
        
        const existingAchievement = await OtherAchievement.findOne({ 
            _id: achievementId, 
            email_id: userEmail 
        });

        if (!existingAchievement) {
            return res.status(404).json({
                success: false,
                message: 'Other achievement not found or unauthorized'
            });
        }
        
        // Update the achievement document. { new: true } returns the updated document,
        // { runValidators: true } ensures schema validators are run on update.
        const updatedAchievement = await OtherAchievement.findByIdAndUpdate(
            achievementId,
            { ...req.body, email_id: userEmail }, // Ensure email_id is not accidentally changed
            { new: true, runValidators: true }
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
 * @desc    Delete other achievement
 * @route   DELETE /api/other-achievement/:id
 * @access  Private (Student)
 */
export const deleteOtherAchievement = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const achievementId = req.params.id; 
        
        const deletedAchievement = await OtherAchievement.findOneAndDelete({
            _id: achievementId,
            email_id: userEmail
        });
        
        if (!deletedAchievement) {
            return res.status(404).json({
                success: false,
                message: 'Other achievement not found or unauthorized'
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
