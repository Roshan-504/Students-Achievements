import PersonalInfo from '../models/student_personal_infoModel.js'; 
import Internship from '../models/internshipsModel.js';
import Course from '../models/course_certificationsModel.js';
import TechnicalActivity from '../models/technical_activitiesModel.js';
import NonTechnicalActivity from '../models/non_technical_activitiesModel.js';
import PaperPublication from '../models/paper_publicationsModel.js';
import EntrepreneurshipProject from '../models/entrepreneurship_projectsModel.js';
import Volunteering from '../models/volunteering_experienceModel.js';
import Patent from '../models/patentsModel.js';
import OtherAchievement from '../models/other_achievementsModel.js';
import Workshop from '../models/workshopModel.js' 

// Map activity types to their models
const activityModels = {
  Internships: Internship,
  'Courses/Certifications': Course,
  'Technical Activities': TechnicalActivity,
  'Non-Technical Activities': NonTechnicalActivity,
  'Paper Publications': PaperPublication,
  'Enterprenurship/Projects': EntrepreneurshipProject,
  Workshops : Workshop,
  Volunteering: Volunteering,
  Patents: Patent,
  'Other Achievements': OtherAchievement,
};

// Route to fetch submission statuses
export const getActivityStatus = async (req, res) => {
  try {
    const email = req.user.email; // From JWT
    const statuses = {};

    // Fetch counts for each activity type
    await Promise.all(
      Object.entries(activityModels).map(async ([title, Model]) => {
        const incompleteCount = await Model.countDocuments({
            email_id: email,
            $or: [
                { end_date: { $type: 10 } }, // matches fields that exist and are explicitly null.
                { 'proof.fileName': { $exists: false } }
            ]
        });


        // Status is "Pending Submission" if there are any incomplete submissions
        statuses[title] = incompleteCount > 0 ? 'Pending Submission' : 'Completed';
      })
    );

    res.json(statuses);
  } catch (error) {
    console.error('Error fetching submission statuses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const getPersonalInfo = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const personalInfo = await PersonalInfo.findOne({ email_id: userEmail });
        
        if (!personalInfo) {
            return res.status(404).json({
                success: false,
                message: 'Personal information not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: personalInfo,
            message: 'Personal information fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching personal information:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching personal information',
            error: error.message
        });
    }
};

/**
 * @desc    Create personal information (first time setup)
 * @route   POST /api/upload/personal-info
 * @access  Private (Student)
 */
export const createPersonalInfo = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        const existingInfo = await PersonalInfo.findOne({ email_id: userEmail });
        if (existingInfo) {
            return res.status(409).json({
                success: false,
                message: 'Personal information already exists. Use PUT to update.'
            });
        }
        
        const personalInfoData = {
            ...req.body,
            email_id: userEmail
        };
        
        const newPersonalInfo = new PersonalInfo(personalInfoData);
        const savedPersonalInfo = await newPersonalInfo.save();
        
        res.status(201).json({
            success: true,
            data: savedPersonalInfo,
            message: 'Personal information created successfully'
        });
    } catch (error) {
        console.error('Error creating personal information:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating personal information',
            error: error.message
        });
    }
};

/**
 * @desc    Update personal information (only updatable fields)
 * @route   PUT /api/personal-info
 * @access  Private (Student)
 */
export const updatePersonalInfo = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        const updatableFields = [
            'current_sgpi', 
            'phone', 
            'linkedin_url', 
            'other_urls'
        ];
        
        const updateData = {};
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No updatable fields provided'
            });
        }
        
        const updatedPersonalInfo = await PersonalInfo.findOneAndUpdate(
            { email_id: userEmail },
            updateData,
            { new: true, runValidators: true } 
        );
        
        if (!updatedPersonalInfo) {
            return res.status(404).json({
                success: false,
                message: 'Personal information not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedPersonalInfo,
            message: 'Personal information updated successfully'
        });
    } catch (error) {
        console.error('Error updating personal information:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating personal information',
            error: error.message
        });
    }
};
