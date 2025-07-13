import Featured from '../models/featuredModel.js'; // Ensure correct path and .js extension

/**
 * @desc    Fetch all featured media for the logged-in student
 * @route   GET /api/featured
 * @access  Private (Student)
 */
export const getFeatured = async (req, res) => {
    try {
        const userEmail = req.user.email;
        // Find featured items associated with the logged-in student's email
        const featuredItems = await Featured.find({ email_id: userEmail });
        
        // Send a success response with the fetched data
        res.status(200).json({
            success: true,
            data: featuredItems,
            message: 'Featured media fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching featured media:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured media',
            error: error.message 
        });
    }
};

/**
 * @desc    Upload new featured media data
 * @route   POST /api/upload/featured
 * @access  Private (Student)
 */
export const uploadFeatured = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        // Combine request body with the user's email for the new featured item data
        const featuredData = {
            ...req.body,
            email_id: userEmail
        };
        
        // Create a new Featured document and save it to the database
        const newFeatured = new Featured(featuredData);
        const savedFeatured = await newFeatured.save();
        
        // Send a success response with the newly created featured item
        res.status(201).json({
            success: true,
            data: savedFeatured,
            message: 'Featured media added successfully'
        });
    } catch (error) {
        console.error('Error adding featured media:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding featured media',
            error: error.message
        });
    }
};

/**
 * @desc    Update an existing featured media
 * @route   PUT /api/featured/:id
 * @access  Private (Student)
 */
export const updateFeatured = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const featuredId = req.params.id; 
        
        const existingFeatured = await Featured.findOne({ 
            _id: featuredId, 
            email_id: userEmail 
        });

        if (!existingFeatured) {
            return res.status(404).json({
                success: false,
                message: 'Featured media not found or unauthorized'
            });
        }
        
        // Update the featured document. { new: true } returns the updated document,
        // { runValidators: true } ensures schema validators are run on update.
        const updatedFeatured = await Featured.findByIdAndUpdate(
            featuredId,
            { ...req.body, email_id: userEmail }, // Ensure email_id is not accidentally changed
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            data: updatedFeatured,
            message: 'Featured media updated successfully'
        });
    } catch (error) {
        console.error('Error updating featured media:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating featured media',
            error: error.message
        });
    }
};

/**
 * @desc    Delete a featured media
 * @route   DELETE /api/featured/:id
 * @access  Private (Student)
 */
export const deleteFeatured = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const featuredId = req.params.id; 
        
        const deletedFeatured = await Featured.findOneAndDelete({
            _id: featuredId,
            email_id: userEmail
        });
        
        if (!deletedFeatured) {
            return res.status(404).json({
                success: false,
                message: 'Featured media not found or unauthorized'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Featured media deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting featured media:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting featured media',
            error: error.message
        });
    }
};
