import mongoose from 'mongoose';
import faculty_profiles from '../models/faculty_profiles.js';
import student_profile from '../models/student_profileModel.js';
import { processExcelData } from '../utils/excelProcessor.js';

import Internship from '../models/internshipsModel.js';
import CourseCertification from '../models/course_certificationsModel.js';
import Entrepreneurship from '../models/entrepreneurship_projectsModel.js';
import NonTechnicalActivity from '../models/non_technical_activitiesModel.js';
import OtherAchievement from '../models/other_achievementsModel.js';
import PaperPublication from '../models/paper_publicationsModel.js';
import TechnicalActivity from '../models/technical_activitiesModel.js';
import Volunteering from '../models/volunteering_experienceModel.js';
import Workshop from '../models/workshopModel.js';
import Patent from '../models/patentsModel.js'; // Assuming you have a patentsModel.js
import Featured from '../models/featuredModel.js'; // Assuming you have a featuredModel.js


// Define all activity models for easy access
const activityModels = {
  Internship,
  CourseCertification,
  Entrepreneurship,
  NonTechnicalActivity,
  OtherAchievement,
  PaperPublication,
  TechnicalActivity,
  Volunteering,
  Workshop,
  Patent, // Added Patent model
  Featured, // Added Featured model
};

export const uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await processExcelData(req.file.buffer, 'students');
    res.json({
      success: true,
      message: `students added successfully`
    });

  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const uploadFaculty = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await processExcelData(req.file.buffer, 'faculty');
    res.json({
      success: true,
      message: `faculty members added successfully`
    });

  } catch (error) {
    res.status(400).json({
      details: error.errors
    });
  }
};


export const getBatches = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required in the request body' });
    }

    const comparisonDate = new Date(date);
    if (isNaN(comparisonDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Aggregate pipeline to get unique combinations and counts
    const pipeline = [
      {
        $group: {
          _id: {
            batch_no: "$batch_no",
            department: "$department",
            division: "$division"
          },
          totalStudents: { $sum: 1 },
          updatedStudents: {
            $sum: {
              $cond: [
                { $gt: ["$last_updated", comparisonDate] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          batch_no: "$_id.batch_no",
          department: "$_id.department",
          division: "$_id.division",
          totalStudents: 1,
          updatedStudents: 1
        }
      },
      {
        $sort: {
          batch_no: 1,
          department: 1,
          division: 1
        }
      }
    ];

    const result = await student_profile.aggregate(pipeline);

    res.json({
      success: true,
      data: result,
      comparisonDate: comparisonDate.toISOString()
    });

  } catch (error) {
    console.error('Error in /get/batches:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};


export const getBatchStudents = async (req, res) => {
  try {
    const { division, department, batch_no, date } = req.query;

    // Validate required fields
    if (!division || !department || !batch_no) {
      return res.status(400).json({
        error: 'All fields (division, department, batch_no) are required'
      });
    }

    // Convert batch_no to number if it's a string
    const batchNumber = typeof batch_no === 'string' ? parseInt(batch_no) : batch_no;
    
    if (isNaN(batchNumber)) {
      return res.status(400).json({
        error: 'batch_no must be a valid number'
      });
    }

    // Build the query
    const query = {
      division: division.toUpperCase(),
      department: department.toUpperCase(),
      batch_no: batchNumber
    };

    // Get students with selected fields
    const students = await student_profile.find(query).sort({
      last_name: 1
    });

    // Add status field based on comparison date
    const studentsWithStatus = students.map(student => {
      const isFilled = student.last_updated && new Date(student.last_updated) > new Date(date);
      return {
        ...student.toObject(),
        status: isFilled ? 'Filled' : 'Not Filled'
      };
    });

    res.json({
      success: true,
      count: studentsWithStatus.length,
      data: studentsWithStatus
    });

  } catch (error) {
    console.error('Error in /students/filter:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export const deleteStudent = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const deletedProfile = await student_profile.findOneAndDelete({ email_id: email });

    if (!deletedProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error while deleting student' });
  }
};

export const getFacultyCount = async (req, res) => {
  try {
    const count = await faculty_profiles.countDocuments();
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};



// Delete batch and all associated activity data with transaction
export const deleteBatch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { batch_no, department, division } = req.query;

    // Validate required parameters
    if (!batch_no || !department || !division) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: 'Batch number, department, and division are required' 
      });
    }

    // Convert batch_no to number
    const batchNumber = parseInt(batch_no);
    if (isNaN(batchNumber)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: 'Batch number must be a valid number' 
      });
    }

    // Find all students in the batch (with session)
    const students = await student_profile.find({
      batch_no: batchNumber,
      department: department.toUpperCase(),
      division: division.toUpperCase()
    }, null, { session });  // Added session option

    if (!students || students.length === 0) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: 'No students found in this batch' 
      });
    }

    // Get all student emails for deletion
    const studentEmails = students.map(student => student.email_id);

    // 1. First delete all activity entries
    let totalActivityDeletions = 0;
    const models = Object.values(activityModels); // Ensure this is an array
    
    for (const model of models) {
      const result = await model.deleteMany(
        { email_id: { $in: studentEmails } },
        { session }
      );
      totalActivityDeletions += result.deletedCount;
    }

    // 2. Then delete student profiles
    const deleteStudentsResult = await student_profile.deleteMany(
      { email_id: { $in: studentEmails } },
      { session }
    );

    // Commit the transaction if everything succeeded
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Batch deleted successfully',
      deletedStudents: deleteStudentsResult.deletedCount,
      deletedActivities: totalActivityDeletions
    });

  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    
    console.error('Error deleting batch:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error during batch deletion - no data was modified',
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};