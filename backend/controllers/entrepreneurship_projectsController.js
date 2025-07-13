import EntrepreneurshipProject from '../models/entrepreneurship_projectsModel.js';

/**
 * @desc    Fetch all entrepreneurship projects for the logged-in student
 * @route   GET /api/entrepreneurship-projects
 * @access  Private (Student)
 */
export const getEntrepreneurshipProjects = async (req, res) => {
    try {
        const userEmail = req.user.email;
        // Find entrepreneurship projects associated with the logged-in student's email
        const projects = await EntrepreneurshipProject.find({ email_id: userEmail });
        
        // Send a success response with the fetched data
        res.status(200).json({
            success: true,
            data: projects,
            message: 'Entrepreneurship projects fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching entrepreneurship projects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching entrepreneurship projects',
            error: error.message 
        });
    }
};

/**
 * @desc    Upload new entrepreneurship project data
 * @route   POST /api/upload/entrepreneurship-project
 * @access  Private (Student)
 */
export const uploadEntrepreneurshipProject = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        // Combine request body with the user's email for the new project data
        const projectData = {
            ...req.body,
            email_id: userEmail
        };
        
        const newProject = new EntrepreneurshipProject(projectData);
        const savedProject = await newProject.save();
        
        res.status(201).json({
            success: true,
            data: savedProject,
            message: 'Entrepreneurship project added successfully'
        });
    } catch (error) {
        console.error('Error adding entrepreneurship project:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding entrepreneurship project',
            error: error.message
        });
    }
};

/**
 * @desc    Update an existing entrepreneurship project
 * @route   PUT /api/entrepreneurship-project/:id
 * @access  Private (Student)
 */
export const updateEntrepreneurshipProject = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const projectId = req.params.id; 
        
        // Find the existing project, ensuring it belongs to the logged-in user
        const existingProject = await EntrepreneurshipProject.findOne({ 
            _id: projectId, 
            email_id: userEmail 
        });

        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: 'Entrepreneurship project not found or unauthorized'
            });
        }
        
        // Update the project document. { new: true } returns the updated document,
        // { runValidators: true } ensures schema validators are run on update.
        const updatedProject = await EntrepreneurshipProject.findByIdAndUpdate(
            projectId,
            { ...req.body, email_id: userEmail }, // Ensure email_id is not accidentally changed
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            data: updatedProject,
            message: 'Entrepreneurship project updated successfully'
        });
    } catch (error) {
        console.error('Error updating entrepreneurship project:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating entrepreneurship project',
            error: error.message
        });
    }
};

/**
 * @desc    Delete an entrepreneurship project
 * @route   DELETE /api/entrepreneurship-project/:id
 * @access  Private (Student)
 */
export const deleteEntrepreneurshipProject = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const projectId = req.params.id; 
        
        // Find and delete the project, ensuring it belongs to the logged-in user
        const deletedProject = await EntrepreneurshipProject.findOneAndDelete({
            _id: projectId,
            email_id: userEmail
        });
        
        if (!deletedProject) {
            return res.status(404).json({
                success: false,
                message: 'Entrepreneurship project not found or unauthorized'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Entrepreneurship project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting entrepreneurship project:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting entrepreneurship project',
            error: error.message
        });
    }
};
