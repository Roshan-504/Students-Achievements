// filterRoutes.js

import express from 'express';
import mongoose from 'mongoose';
import PersonalInfo from '../models/student_profileModel.js';
import Internship from '../models/internshipsModel.js';
import CourseCertification from '../models/course_certificationsModel.js';
import Entrepreneurship from '../models/entrepreneurship_projectsModel.js';
import NonTechnicalActivity from '../models/non_technical_activitiesModel.js';
import OtherAchievement from '../models/other_achievementsModel.js';
import PaperPublication from '../models/paper_publicationsModel.js';
import TechnicalActivity from '../models/technical_activitiesModel.js';
import Volunteering from '../models/volunteering_experienceModel.js';
import Workshop from '../models/workshopModel.js';
import ContactUs from '../models/contact_us.js';
import Patent from '../models/patentsModel.js';
import Featured from '../models/featuredModel.js'; 

import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

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
  Patent, 
  Featured, 
};

// Helper function to get the relevant date field name for an activity type
const getRelevantDateField = (activityType) => {
  switch (activityType) {
    case 'Internship':
    case 'CourseCertification':
    case 'Volunteering':
      return 'start_date';
    case 'TechnicalActivity':
    case 'NonTechnicalActivity':
    case 'Workshop':
      return 'date';
    case 'PaperPublication':
      return 'date_of_publication';
    case 'Patent': // Fixed the typo - was 'Patents'
      return 'application_date';
    case 'OtherAchievement':
    case 'Entrepreneurship':
      return 'createdAt';
    case 'Featured':
      return 'date';
    default:
      return null;
  }
};

// Route to filter student profiles
router.get('/students', authenticate, authorizeRoles('faculty','admin'), async (req, res) => {
  try {

    const {
      department,
      batch_no,
      division, // Changed from class_division to division
      sgpi_min,
      sgpi_max,
      gender,
      email,
      prn,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    
    // Department filter: handles comma-separated departments for $in operator
    if (department) query.department = { $in: department.split(',') };
    
    // Batch number filter: converts to Number
    if (batch_no) query.batch_no = Number(batch_no);
    
    // Division filter - Fixed field name
    if (division) query.division = division; 
    
    // SGPI range filter - Fixed field name to match schema
    if (sgpi_min || sgpi_max) {
      query.average_sgpi = {}; // Changed from current_sgpi to average_sgpi
      if (sgpi_min) query.average_sgpi.$gte = Number(sgpi_min);
      if (sgpi_max) query.average_sgpi.$lte = Number(sgpi_max);
    }
    
    // Gender filter
    if (gender) query.gender = gender;
    
    // Email filter: uses regex for partial match (case-insensitive)
    if (email) query.email_id = { $regex: email, $options: 'i' };
    
    // PRN filter: uses regex for partial match (case-insensitive)
    if (prn) query.prn = { $regex: prn, $options: 'i' };

    const students = await PersonalInfo.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('email_id prn first_name last_name department batch_no division average_sgpi gender');

    const total = await PersonalInfo.countDocuments(query);

    res.json({
      students,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to filter activities
router.get('/activities', authenticate, authorizeRoles('faculty','admin'), async (req, res) => {
  try {

    const {
      activity_type,
      email_id, // This comes from frontend when student filters are applied
      status,
      start_date,
      end_date,
      page = 1,
      limit = 10,
      // Student filter parameters
      department,
      batch_no,
      division,
      gender,
      email,
      prn,
    } = req.query;

    // Step 1: Get filtered student emails if student filters are applied
    let filteredStudentEmails = [];
    const isStudentFilterApplied = department || batch_no || division || gender || email || prn;
    
    if (isStudentFilterApplied) {
      const studentQuery = {};
      if (department) studentQuery.department = { $in: department.split(',') };
      if (batch_no) studentQuery.batch_no = Number(batch_no);
      if (division) studentQuery.division = division;
      if (gender) studentQuery.gender = gender;
      if (email) studentQuery.email_id = { $regex: email, $options: 'i' };
      if (prn) studentQuery.prn = { $regex: prn, $options: 'i' };

      const filteredStudents = await PersonalInfo.find(studentQuery).select('email_id');
      filteredStudentEmails = filteredStudents.map(student => student.email_id);
      
      // If no students match the criteria, return empty results
      if (filteredStudentEmails.length === 0) {
        return res.json({
          activities: [],
          total: 0,
          page: Number(page),
          pages: 0,
          total_completed: 0,
          total_pending: 0,
          total_unique_students: 0
        });
      }
    }

    // Step 2: Build activity query
    const baseMatchQuery = {};
    
    // If student filters were applied, only include those emails
    // If email_id was passed directly (from previous logic), use that
    // Otherwise, if student filters were applied, use the filtered emails
    if (email_id) {
      baseMatchQuery.email_id = { $in: email_id.split(',') };
    } else if (filteredStudentEmails.length > 0) {
      baseMatchQuery.email_id = { $in: filteredStudentEmails };
    }

    // Step 3: Apply activity status filters
    let activities = [];
    let total = 0;
    let total_completed = 0;
    let total_pending = 0;
    let unique_students_count = 0;

    if (activity_type === 'All') {
      let allFilteredActivities = [];
      let uniqueEmails = new Set();
      let completedCount = 0;
      let pendingCount = 0;

      // Iterate through all activity models
      for (const type of Object.keys(activityModels)) {
        const Model = activityModels[type];
        if (!Model) continue;

        const modelQuery = { ...baseMatchQuery };
        const specificDateField = getRelevantDateField(type);

        // Apply date range filter
        if (specificDateField && (start_date || end_date)) {
          const dateFilter = {};
          if (start_date) dateFilter.$gte = new Date(start_date);
          if (end_date) {
            const endOfDay = new Date(end_date);
            endOfDay.setHours(23, 59, 59, 999);
            dateFilter.$lte = endOfDay;
          }
          modelQuery[specificDateField] = dateFilter;
        }
        
        const currentActivities = await Model.find(modelQuery).select('-proof.data').lean().exec();
        
        currentActivities.forEach(activity => {
          const hasProof = activity.proof?.fileName;
          const needsEndDateForCompletion = ['Internship', 'CourseCertification'].includes(type);
          const hasValidEndDate = activity.end_date !== null && activity.end_date !== undefined;

          const activityStatus = (hasProof && (!needsEndDateForCompletion || hasValidEndDate)) ? 'Completed' : 'Pending';
          
          // Apply status filter
          if (status) {
            if (status === 'completed' && activityStatus !== 'Completed') return;
            if (status === 'pending' && activityStatus !== 'Pending') return;
          }

          if (activityStatus === 'Completed') {
            completedCount++;
          } else {
            pendingCount++;
          }
          
          uniqueEmails.add(activity.email_id);
          allFilteredActivities.push({ ...activity, activity_type: type, status: activityStatus });
        });
      }

      // Sort activities by date
      allFilteredActivities.sort((a, b) => {
        const dateA = new Date(a.start_date || a.date || a.date_of_publication || a.application_date || a.createdAt);
        const dateB = new Date(b.start_date || b.date || b.date_of_publication || b.application_date || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      total = allFilteredActivities.length;
      total_completed = completedCount;
      total_pending = pendingCount;
      unique_students_count = uniqueEmails.size;

      // Apply pagination
      activities = allFilteredActivities.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    } else {
      // Handle single activity type
      const Model = activityModels[activity_type];
      if (!Model) return res.status(400).json({ message: 'Invalid activity type' });

      const modelQuery = { ...baseMatchQuery };
      const specificDateField = getRelevantDateField(activity_type);

      // Apply date range filter
      if (specificDateField && (start_date || end_date)) {
        const dateFilter = {};
        if (start_date) dateFilter.$gte = new Date(start_date);
        if (end_date) {
            const endOfDay = new Date(end_date);
            endOfDay.setHours(23, 59, 59, 999);
            dateFilter.$lte = endOfDay;
        }
        modelQuery[specificDateField] = dateFilter;
      }

      // Apply status filter to query
      if (status === 'pending') {
        modelQuery.$or = [
          { 'proof.fileName': { $eq: null } },
          { 'proof.fileName': { $exists: false } },
          ...(activity_type === 'Internship' || activity_type === 'CourseCertification' 
            ? [{ end_date: { $eq: null } }, { end_date: { $exists: false } }] 
            : []
          )
        ];
      } else if (status === 'completed') {
        const completedQuery = [{ 'proof.fileName': { $ne: null, $exists: true } }];
        if (activity_type === 'Internship' || activity_type === 'CourseCertification') {
          completedQuery.push({ end_date: { $ne: null, $exists: true } });
        }
        if (completedQuery.length > 1) {
          modelQuery.$and = completedQuery;
        } else {
          Object.assign(modelQuery, completedQuery[0]);
        }
      }
      
      const [totalCount, modelActivities, uniqueEmailsArray] = await Promise.all([
        Model.countDocuments(modelQuery),
        Model.find(modelQuery)
          .sort({ 
            [specificDateField || 'createdAt']: -1
          })
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit))
          .select('-proof.data')
          .lean()
          .exec(),
        Model.distinct('email_id', modelQuery)
      ]);

      activities = modelActivities.map(a => {
        const hasProof = a.proof?.fileName;
        const needsEndDateForCompletion = ['Internship', 'CourseCertification'].includes(activity_type);
        const hasValidEndDate = a.end_date !== null && a.end_date !== undefined;
        const calculatedStatus = (hasProof && (!needsEndDateForCompletion || hasValidEndDate)) ? 'Completed' : 'Pending';
        return { ...a, activity_type, status: calculatedStatus };
      });

      total = totalCount;
      unique_students_count = uniqueEmailsArray.length;

      // Calculate completed and pending counts for single activity type
      const allFilteredActivitiesForCounts = await Model.find(modelQuery).select('proof end_date').lean().exec();
      allFilteredActivitiesForCounts.forEach(activity => {
        const hasProof = activity.proof?.fileName;
        const needsEndDateForCompletion = ['Internship', 'CourseCertification'].includes(activity_type);
        const hasValidEndDate = activity.end_date !== null && activity.end_date !== undefined;
        if (hasProof && (!needsEndDateForCompletion || hasValidEndDate)) {
          total_completed++;
        } else {
          total_pending++;
        }
      });
    }

    res.json({
      activities: activities,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total_completed,
      total_pending,
      total_unique_students: unique_students_count
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to download proof
router.get('/activities/proof/:id', authenticate, authorizeRoles('faculty','admin'), async (req, res) => {
  try {
    const { activity_type } = req.query;
    if (!activity_type || !activityModels[activity_type]) {
      return res.status(400).json({ message: 'Invalid activity type' });
    }
    const activity = await activityModels[activity_type].findById(req.params.id);
    if (!activity || !activity.proof?.data) {
      return res.status(404).json({ message: 'Proof not found' });
    }
    res.set('Content-Type', activity.proof.contentType);
    res.set('Content-Disposition', `attachment; filename="${activity.proof.fileName}"`);
    res.send(activity.proof.data);
  } catch (error) {
    console.error('Error downloading proof:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to download all filtered activities as CSV or multi-tab Excel
router.get('/activities/download', authenticate, authorizeRoles('faculty','admin'), async (req, res) => {
  try {

    const {
      activity_type,
      email_id,
      status,
      start_date,
      end_date,
      // Student filter parameters
      department,
      batch_no,
      division,
      gender,
      email,
      prn,
    } = req.query;

    // Step 1: Get filtered student emails if student filters are applied
    let filteredStudentEmails = [];
    const isStudentFilterApplied = department || batch_no || division || gender || email || prn;
    
    if (isStudentFilterApplied) {
      const studentQuery = {};
      if (department) studentQuery.department = { $in: department.split(',') };
      if (batch_no) studentQuery.batch_no = Number(batch_no);
      if (division) studentQuery.division = division;
      if (gender) studentQuery.gender = gender;
      if (email) studentQuery.email_id = { $regex: email, $options: 'i' };
      if (prn) studentQuery.prn = { $regex: prn, $options: 'i' };

      const filteredStudents = await PersonalInfo.find(studentQuery).select('email_id');
      filteredStudentEmails = filteredStudents.map(student => student.email_id);
      
      if (filteredStudentEmails.length === 0) {
        // Return empty data based on activity type
        if (activity_type === 'All') {
          return res.json({});
        } else {
          return res.json([]);
        }
      }
    }

    // Step 2: Build base query for activities
    const baseMatchQuery = {};
    if (email_id) {
      baseMatchQuery.email_id = { $in: email_id.split(',') };
    } else if (filteredStudentEmails.length > 0) {
      baseMatchQuery.email_id = { $in: filteredStudentEmails };
    }

    if (activity_type === 'All') {
      const allData = {};
      
      // Define the activity types in the order you want them
      const activityTypes = [
        'Internship', 'CourseCertification', 'Entrepreneurship',
        'OtherAchievement', 'NonTechnicalActivity', 'TechnicalActivity',
        'Workshop', 'PaperPublication', 'Volunteering', 'Patent', 'Featured'
      ];
      
      // Fetch data for each activity type
      for (const type of activityTypes) {
        const Model = activityModels[type];
        if (!Model) continue;

        const modelQuery = { ...baseMatchQuery };
        const specificDateField = getRelevantDateField(type);

        if (specificDateField && (start_date || end_date)) {
          const dateFilter = {};
          if (start_date) dateFilter.$gte = new Date(start_date);
          if (end_date) {
            const endOfDay = new Date(end_date);
            endOfDay.setHours(23, 59, 59, 999);
            dateFilter.$lte = endOfDay;
          }
          modelQuery[specificDateField] = dateFilter;
        }

        // Apply status filter to query
        if (status === 'pending') {
          modelQuery.$or = [
            { 'proof.fileName': { $eq: null } },
            { 'proof.fileName': { $exists: false } },
            ...(type === 'Internship' || type === 'CourseCertification' 
              ? [{ end_date: { $eq: null } }, { end_date: { $exists: false } }] 
              : []
            )
          ];
        } else if (status === 'completed') {
          const completedQuery = [{ 'proof.fileName': { $ne: null, $exists: true } }];
          if (type === 'Internship' || type === 'CourseCertification') {
            completedQuery.push({ end_date: { $ne: null, $exists: true } });
          }
          if (completedQuery.length > 1) {
            modelQuery.$and = completedQuery;
          } else {
            Object.assign(modelQuery, completedQuery[0]);
          }
        }

        const activitiesForType = await Model.find(modelQuery)
          .select('-proof.data')
          .lean()
          .exec();
        
        // Format activities with calculated status and formatted dates
        allData[type] = activitiesForType.map(activity => {
          const hasProof = activity.proof?.fileName;
          const needsEndDateForCompletion = ['Internship', 'CourseCertification'].includes(type);
          const hasValidEndDate = activity.end_date !== null && activity.end_date !== undefined;
          const calculatedStatus = (hasProof && (!needsEndDateForCompletion || hasValidEndDate)) ? 'Completed' : 'Pending';
          
          return {
            ...activity,
            activity_type: type,
            status: calculatedStatus,
            start_date: activity.start_date ? new Date(activity.start_date).toLocaleDateString() : '',
            end_date: activity.end_date ? new Date(activity.end_date).toLocaleDateString() : '',
            date: activity.date ? new Date(activity.date).toLocaleDateString() : '',
            date_of_publication: activity.date_of_publication ? new Date(activity.date_of_publication).toLocaleDateString() : '',
            application_date: activity.application_date ? new Date(activity.application_date).toLocaleDateString() : '',
            createdAt: activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '',
            updatedAt: activity.updatedAt ? new Date(activity.updatedAt).toLocaleDateString() : '',
          };
        });
      }
      
      res.json(allData); // Send JSON object with data for each tab
      
    } else {
      // Handle single activity type CSV export
      const Model = activityModels[activity_type];
      if (!Model) {
        return res.status(400).json({ message: 'Invalid activity type' });
      }

      const modelQuery = { ...baseMatchQuery };
      const specificDateField = getRelevantDateField(activity_type);

      if (specificDateField && (start_date || end_date)) {
        const dateFilter = {};
        if (start_date) dateFilter.$gte = new Date(start_date);
        if (end_date) {
          const endOfDay = new Date(end_date);
          endOfDay.setHours(23, 59, 59, 999);
          dateFilter.$lte = endOfDay;
        }
        modelQuery[specificDateField] = dateFilter;
      }

      // Apply status filter to query
      if (status === 'pending') {
        modelQuery.$or = [
          { 'proof.fileName': { $eq: null } },
          { 'proof.fileName': { $exists: false } },
          ...(activity_type === 'Internship' || activity_type === 'CourseCertification' 
            ? [{ end_date: { $eq: null } }, { end_date: { $exists: false } }] 
            : []
          )
        ];
      } else if (status === 'completed') {
        const completedQuery = [{ 'proof.fileName': { $ne: null, $exists: true } }];
        if (activity_type === 'Internship' || activity_type === 'CourseCertification') {
          completedQuery.push({ end_date: { $ne: null, $exists: true } });
        }
        if (completedQuery.length > 1) {
          modelQuery.$and = completedQuery;
        } else {
          Object.assign(modelQuery, completedQuery[0]);
        }
      }

      const activities = await Model.find(modelQuery)
        .sort({ [specificDateField || 'createdAt']: 1 })
        .select('-proof.data')
        .lean()
        .exec();
      
      const finalActivities = activities.map((activity) => {
        const hasProof = activity.proof?.fileName;
        const needsEndDateForCompletion = ['Internship', 'CourseCertification'].includes(activity_type);
        const hasValidEndDate = activity.end_date !== null && activity.end_date !== undefined;
        const calculatedStatus = (hasProof && (!needsEndDateForCompletion || hasValidEndDate)) ? 'Completed' : 'Pending';
        
        return {
          ...activity,
          activity_type,
          status: calculatedStatus,
          start_date: activity.start_date ? new Date(activity.start_date).toLocaleDateString() : '',
          end_date: activity.end_date ? new Date(activity.end_date).toLocaleDateString() : '',
          date: activity.date ? new Date(activity.date).toLocaleDateString() : '',
          date_of_publication: activity.date_of_publication ? new Date(activity.date_of_publication).toLocaleDateString() : '',
          application_date: activity.application_date ? new Date(activity.application_date).toLocaleDateString() : '',
          createdAt: activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '',
          updatedAt: activity.updatedAt ? new Date(activity.updatedAt).toLocaleDateString() : '',
        };
      });

      // Convert data to CSV format
      if (finalActivities.length === 0) {
        const csv = 'No data available';
        res.header('Content-Type', 'text/csv');
        res.attachment(`${activity_type}_activities.csv`);
        res.send(csv);
        return;
      }

      const fields = Object.keys(finalActivities[0]);
      const replacer = (key, value) => (value === null ? '' : value);
      let csv = finalActivities.map((row) =>
        fields
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(',')
      );
      csv.unshift(fields.join(','));
      csv = csv.join('\r\n');

      res.header('Content-Type', 'text/csv');
      res.attachment(`${activity_type}_activities.csv`);
      res.send(csv);
    }
  } catch (error) {
    console.error('Error downloading activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to filter ContactUs submissions (no changes needed)
router.get('/contacts', authenticate, authorizeRoles('faculty','admin'), async (req, res) => {
  try {

    const { type, status, email, start_date, end_date, page = 1, limit = 10 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (email) query.email = { $regex: email, $options: 'i' };
    if (start_date || end_date) {
      query.createdAt = {};
      if (start_date) query.createdAt.$gte = new Date(start_date);
      if (end_date) query.createdAt.$lte = new Date(end_date);
    }

    const contacts = await ContactUs.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('name email type subject status createdAt');

    const total = await ContactUs.countDocuments(query);

    res.json({
      contacts,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;