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
import Patent from '../models/patentsModel.js'; // Assuming you have a patentsModel.js
import Featured from '../models/featuredModel.js'; // Assuming you have a featuredModel.js

import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

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

// Helper function to get the relevant date field name for an activity type
// This is crucial for applying date range filters correctly across different activity schemas.
const getRelevantDateField = (activityType) => {
  switch (activityType) {
    case 'Internship':
    case 'CourseCertification':
    case 'Volunteering':
      return 'start_date'; // These activities typically have a start_date
    case 'TechnicalActivity':
    case 'NonTechnicalActivity':
    case 'Workshop':
      return 'date'; // These activities typically have a single 'date' field
    case 'PaperPublication':
      return 'date_of_publication'; // Specific field for paper publications
    case 'Patents':
      return 'application_date'; // Specific field for patents
    case 'OtherAchievement':
    case 'Entrepreneurship':
    case 'Featured':
      return 'createdAt'; // Fallback to createdAt if no specific date field, or as requested
    default:
      return null; // No relevant date field found
  }
};

// Route to filter student profiles based on multiple criteria
router.get('/students', authenticate, async (req, res) => {
  try {
    // Ensure only faculty can access this route
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Extract filter parameters from the query string
    const {
      department,
      batch_no,
      class_division, // Frontend uses class_division, maps to 'division' in schema
      sgpi_min,
      sgpi_max,
      gender,
      email, // Refers to student's email_id
      prn,
      page = 1,
      limit = 10,
    } = req.query;

    // Build the MongoDB query object. All conditions are implicitly ANDed.
    const query = {};

    // Department filter: allows selecting multiple departments using $in operator
    if (department) {
      query.department = { $in: department.split(',') };
    }
    // Batch number filter: ensures the value is treated as a number
    if (batch_no) {
      query.batch_no = Number(batch_no);
    }
    // Class division filter: maps to the 'division' field in the schema
    if (class_division) {
      query.division = class_division;
    }
    // SGPI range filter: applies greater than or equal to ($gte) and less than or equal to ($lte)
    if (sgpi_min || sgpi_max) {
      query.average_sgpi = {}; // Use average_sgpi as per your schema
      if (sgpi_min) query.average_sgpi.$gte = Number(sgpi_min);
      if (sgpi_max) query.average_sgpi.$lte = Number(sgpi_max);
    }
    // Gender filter
    if (gender) {
      query.gender = gender;
    }
    // Email filter: uses regex for partial, case-insensitive matching on email_id
    if (email) {
      query.email_id = { $regex: email, $options: 'i' };
    }
    // PRN filter: uses regex for partial, case-insensitive matching on prn
    if (prn) {
      query.prn = { $regex: prn, $options: 'i' };
    }

    // Fetch student profiles based on the constructed query, with pagination and selection
    const students = await PersonalInfo.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('email_id prn first_name last_name department batch_no division average_sgpi gender');

    // Get the total count of documents matching the query for pagination
    const total = await PersonalInfo.countDocuments(query);

    // Send the filtered students and pagination info as a JSON response
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

// Route to filter activities based on activity type, student email, status, and date range
router.get('/activities', authenticate, async (req, res) => {
  try {
    // Ensure only faculty can access this route
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Extract filter parameters from the query string
    const {
      activity_type,
      email_id, // This will be a comma-separated string of emails from student filters
      status,
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = req.query;

    // Base query for activities, primarily for filtering by student email_id
    const baseMatchQuery = {};
    if (email_id) {
      // If email_id is provided (e.g., from student filters), use $in operator
      // If email_id is an empty string (e.g., no students matched student filters),
      // email_id.split(',') will be [''], and $in: [''] will match no documents,
      // effectively filtering out all activities, which is the desired behavior.
      baseMatchQuery.email_id = { $in: email_id.split(',') };
    }

    // Status filtering logic: 'completed' requires proof and potentially end_date, 'pending' otherwise
    const statusMatch = {};
    if (status === 'pending') {
      statusMatch.$or = [
        { 'proof.fileName': { $eq: null } }, // Proof is missing
        // For activities like internships/course certifications, consider pending if end_date is also missing
        { activity_type: { $in: ['Internship', 'CourseCertification'] }, end_date: { $eq: null } }
      ];
    } else if (status === 'completed') {
      statusMatch['proof.fileName'] = { $ne: null }; // Proof must exist
      statusMatch.$or = [
        { activity_type: { $nin: ['Internship', 'CourseCertification'] } }, // Not internship/course, so proof is enough
        { activity_type: { $in: ['Internship', 'CourseCertification'] }, end_date: { $ne: null } } // Internship/course needs end_date
      ];
    }

    // Combine base query with status filter using $and if status filter is active
    const combinedMatchQuery = { ...baseMatchQuery };
    if (Object.keys(statusMatch).length > 0) {
        combinedMatchQuery.$and = (combinedMatchQuery.$and || []).concat(statusMatch);
    }

    let activities = [];
    let total = 0;
    let total_completed = 0;
    let total_pending = 0;
    let unique_students_count = 0;

    // Handle 'All' activity types separately to aggregate data from all models
    if (activity_type === 'All') {
      let allFilteredActivities = [];
      let uniqueEmails = new Set();
      let completedCount = 0;
      let pendingCount = 0;

      // Iterate through all defined activity models
      for (const type of Object.keys(activityModels)) {
        const Model = activityModels[type];
        if (!Model) continue; // Skip if model is not defined

        const modelQuery = { ...baseMatchQuery }; // Start with baseMatchQuery (including email_id filter)
        const specificDateField = getRelevantDateField(type);

        // Apply date range filter to the specific date field for the current model
        if (specificDateField && (start_date || end_date)) {
          const dateFilter = {};
          if (start_date) dateFilter.$gte = new Date(start_date);
          if (end_date) {
            const endOfDay = new Date(end_date);
            endOfDay.setHours(23, 59, 59, 999); // Set to end of the day for inclusive range
            dateFilter.$lte = endOfDay;
          }
          modelQuery[specificDateField] = dateFilter;
        }
        
        // Fetch activities for the current model, excluding binary proof data
        const currentActivities = await Model.find(modelQuery).select('-proof.data').lean().exec();
        
        // Process each activity to determine its status and collect unique emails
        currentActivities.forEach(activity => {
          const hasProof = activity.proof?.fileName;
          // Determine if end_date is required for completion for this activity type
          const needsEndDateForCompletion = ['Internship', 'CourseCertification'].includes(type);
          const hasValidEndDate = activity.end_date !== null && activity.end_date !== undefined;

          // Calculate activity status
          const activityStatus = (hasProof && (!needsEndDateForCompletion || hasValidEndDate)) ? 'Completed' : 'Pending';
          
          // Apply the status filter for 'All' activities at this stage
          if (status) {
            if (status === 'completed' && activityStatus !== 'Completed') return;
            if (status === 'pending' && activityStatus !== 'Pending') return;
          }

          // Increment counts based on filtered status
          if (activityStatus === 'Completed') {
            completedCount++;
          } else {
            pendingCount++;
          }
          uniqueEmails.add(activity.email_id); // Add student email to set for unique count
          allFilteredActivities.push({ ...activity, activity_type: type, status: activityStatus });
        });
      }

      // Sort all collected activities by their relevant date (newest first)
      allFilteredActivities.sort((a, b) => {
        const dateA = new Date(a.start_date || a.date || a.date_of_publication || a.application_date || a.createdAt);
        const dateB = new Date(b.start_date || b.date || b.date_of_publication || b.application_date || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      // Update total counts and unique students count
      total = allFilteredActivities.length;
      total_completed = completedCount;
      total_pending = pendingCount;
      unique_students_count = uniqueEmails.size;

      // Apply pagination to the combined and sorted activities
      activities = allFilteredActivities.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    } else {
      // Handle single activity type filtering
      const Model = activityModels[activity_type];
      if (!Model) {
        return res.status(400).json({ message: 'Invalid activity type' });
      }

      const modelQuery = { ...combinedMatchQuery }; // Start with combinedMatchQuery (includes email_id and status)
      const specificDateField = getRelevantDateField(activity_type);

      // Apply date range filter to the specific date field for the selected model
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
      
      // Fetch total count, paginated activities, and unique emails for the single activity type
      const [totalCount, modelActivities, uniqueEmailsArray] = await Promise.all([
        Model.countDocuments(modelQuery),
        Model.find(modelQuery)
          .sort({ 
            start_date: -1, // Sort by relevant date fields in descending order
            date: -1, 
            date_of_publication: -1,
            application_date: -1,
            createdAt: -1 
          })
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit))
          .select('-proof.data') // Exclude binary proof data
          .lean()
          .exec(),
        Model.distinct('email_id', modelQuery) // Get unique emails for the current filtered set
      ]);

      // Map activities to include activity_type and calculated status for display
      activities = modelActivities.map(a => {
        const hasProof = a.proof?.fileName;
        const needsEndDateForCompletion = ['Internship', 'CourseCertification'].includes(activity_type);
        const hasValidEndDate = a.end_date !== null && a.end_date !== undefined;
        const currentStatus = (hasProof && (!needsEndDateForCompletion || hasValidEndDate)) ? 'Completed' : 'Pending';
        return { ...a, activity_type, status: currentStatus };
      });

      total = totalCount;
      unique_students_count = uniqueEmailsArray.length;

      // Calculate completed and pending for single activity type by fetching all filtered data (efficiently)
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

    // Send response with paginated activities and all calculated counts
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

// Route to download proof file for a specific activity
router.get('/activities/proof/:id', authenticate, async (req, res) => {
  try {
    // Ensure only faculty can access this route
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    // Get activity type from query to select the correct model
    const { activity_type } = req.query;
    if (!activity_type || !activityModels[activity_type]) {
      return res.status(400).json({ message: 'Invalid activity type' });
    }
    // Find the activity by ID
    const activity = await activityModels[activity_type].findById(req.params.id);
    // Check if activity and its proof data exist
    if (!activity || !activity.proof?.data) {
      return res.status(404).json({ message: 'Proof not found' });
    }
    // Set response headers for file download
    res.set('Content-Type', activity.proof.contentType);
    res.set('Content-Disposition', `attachment; filename="${activity.proof.fileName}"`);
    // Send the binary proof data
    res.send(activity.proof.data);
  } catch (error) {
    console.error('Error downloading proof:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to download all filtered activities as CSV or multi-tab Excel
router.get('/activities/download', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { activity_type, email_id, status, start_date, end_date } = req.query;

    const baseMatchQuery = {};
    if (email_id) baseMatchQuery.email_id = { $in: email_id.split(',') };

    const statusMatch = {};
    if (status === 'pending') {
      statusMatch.$or = [
        { 'proof.fileName': { $eq: null } },
        { 'end_date': { $eq: null } }
      ];
    } else if (status === 'completed') {
      statusMatch['proof.fileName'] = { $ne: null };
      statusMatch.end_date = { $ne: null };
    }
    const combinedMatchQuery = { ...baseMatchQuery, ...statusMatch };

    if (activity_type === 'All') {
      const allData = {};
      // Fetch data for each activity type
      for (const type of Object.keys(activityModels)) {
        const Model = activityModels[type];
        if (!Model) continue;

        const modelQuery = { ...combinedMatchQuery };
        const specificDateField = getRelevantDateField(type);

        if (specificDateField && (start_date || end_date)) {
          const dateFilter = {};
          if (start_date) dateFilter.$gte = new Date(start_date);
          if (end_date) dateFilter.$lte = new Date(end_date);
          modelQuery[specificDateField] = dateFilter;
        }

        const activitiesForType = await Model.find(modelQuery)
          .select('-proof.data') // Exclude binary proof data
          .lean()
          .exec();
        
        // Map activities to include activity_type, calculated status, and formatted dates
        allData[type] = activitiesForType.map(activity => ({
          ...activity,
          activity_type: type,
          status: activity.proof?.fileName && activity.end_date ? 'Completed' : 'Pending',
          // Format dates for consistency in export
          start_date: activity.start_date ? new Date(activity.start_date).toLocaleDateString() : '',
          end_date: activity.end_date ? new Date(activity.end_date).toLocaleDateString() : '',
          date: activity.date ? new Date(activity.date).toLocaleDateString() : '',
          date_of_publication: activity.date_of_publication ? new Date(activity.date_of_publication).toLocaleDateString() : '',
          application_date: activity.application_date ? new Date(activity.application_date).toLocaleDateString() : '',
          createdAt: activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '',
          updatedAt: activity.updatedAt ? new Date(activity.updatedAt).toLocaleDateString() : '',
        }));
      }
      res.json(allData); // Send a JSON object with data for each tab
    } else {
      // Handle single activity type CSV export
      const Model = activityModels[activity_type];
      if (!Model) {
        return res.status(400).json({ message: 'Invalid activity type' });
      }

      const modelQuery = { ...combinedMatchQuery };
      const specificDateField = getRelevantDateField(activity_type);

      if (specificDateField && (start_date || end_date)) {
        const dateFilter = {};
        if (start_date) dateFilter.$gte = new Date(start_date);
        if (end_date) dateFilter.$lte = new Date(end_date);
        modelQuery[specificDateField] = dateFilter;
      }

      const activities = await Model.find(modelQuery)
        .sort({ start_date: 1, date: 1, date_of_publication: 1, application_date: 1 })
        .select('-proof.data')
        .lean()
        .exec();
      
      const finalActivities = activities.map((activity) => ({
        ...activity,
        activity_type,
        status: activity.proof?.fileName && activity.end_date ? 'Completed' : 'Pending',
        // Format dates for consistency in export
        start_date: activity.start_date ? new Date(activity.start_date).toLocaleDateString() : '',
        end_date: activity.end_date ? new Date(activity.end_date).toLocaleDateString() : '',
        date: activity.date ? new Date(activity.date).toLocaleDateString() : '',
        date_of_publication: activity.date_of_publication ? new Date(activity.date_of_publication).toLocaleDateString() : '',
        application_date: activity.application_date ? new Date(activity.application_date).toLocaleDateString() : '',
        createdAt: activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '',
        updatedAt: activity.updatedAt ? new Date(activity.updatedAt).toLocaleDateString() : '',
      }));

      // Convert data to CSV format
      const fields = Object.keys(finalActivities[0] || {}); // Get all keys from the first object
      const replacer = (key, value) => (value === null ? '' : value); // Handle null values for CSV
      let csv = finalActivities.map((row) =>
        fields
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(',')
      );
      csv.unshift(fields.join(',')); // Add header row
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


// Route to filter ContactUs submissions (no changes needed as per request)
router.get('/contacts', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

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
