import student_profile from '../models/student_profileModel.js'; 
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


// Route to update student profile
export const updateStudentProfile = async (req, res) => {
  try {

    const updateData = req.body;

    // Validate data types
    if (updateData.batch_no && !Number.isInteger(Number(updateData.batch_no))) {
      return res.status(400).json({ message: 'Batch number must be an integer' });
    }
    if (updateData.average_sgpi && (isNaN(updateData.average_sgpi) || updateData.average_sgpi < 0 || updateData.average_sgpi > 10)) {
      return res.status(400).json({ message: 'Average SGPI must be between 0 and 10' });
    }
    if (updateData.phone && !updateData.phone.match(/^\+?\d{10,15}$/)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }
    if (updateData.linkedin_url && !updateData.linkedin_url.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/)) {
      return res.status(400).json({ message: 'Invalid LinkedIn URL' });
    }
    if (updateData.other_urls && !Array.isArray(updateData.other_urls)) {
      return res.status(400).json({ message: 'Other URLs must be an array' });
    }
    if (updateData.other_urls && updateData.other_urls.some(url => !url.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/))) {
      return res.status(400).json({ message: 'Invalid URL in other_urls' });
    }

    // Update profile
    const update = { ...updateData, last_updated: new Date() };
    const profile = await PersonalInfo.findOneAndUpdate(
      { email_id: req.user.email },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const getPersonalInfo = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const personalInfo = await student_profile.findOne({ email_id: userEmail });
        
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

