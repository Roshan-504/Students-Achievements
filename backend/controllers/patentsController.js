import Patent from '../models/patentsModel.js'; 

/**
 * @desc    Fetch all patents for the logged-in student
 * @route   GET /api/patents
 * @access  Private (Student)
 */
export const getPatents = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const patents = await Patent.find({ email_id: userEmail });
        
        res.status(200).json({
            success: true,
            data: patents,
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
        
        const patentData = {
            ...req.body,
            email_id: userEmail
        };
        
        const newPatent = new Patent(patentData);
        const savedPatent = await newPatent.save();
        
        res.status(201).json({
            success: true,
            data: savedPatent,
            message: 'Patent added successfully'
        });
    } catch (error) {
        console.error('Error adding patent:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding patent',
            error: error.message
        });
    }
};

/**
 * @desc    Update existing patent
 * @route   PUT /api/patent/:id
 * @access  Private (Student)
 */
export const updatePatent = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const patentId = req.params.id; 
        
        const existingPatent = await Patent.findOne({ 
            _id: patentId, 
            email_id: userEmail 
        });

        if (!existingPatent) {
            return res.status(404).json({
                success: false,
                message: 'Patent not found or unauthorized'
            });
        }
        
        // Update the patent document. { new: true } returns the updated document,
        // { runValidators: true } ensures schema validators are run on update.
        const updatedPatent = await Patent.findByIdAndUpdate(
            patentId,
            { ...req.body, email_id: userEmail }, // Ensure email_id is not accidentally changed
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            data: updatedPatent,
            message: 'Patent updated successfully'
        });
    } catch (error) {
        console.error('Error updating patent:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating patent',
            error: error.message
        });
    }
};

/**
 * @desc    Delete patent
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
