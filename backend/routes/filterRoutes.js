import express from 'express';
import mongoose from 'mongoose';
import PersonalInfo from '../models/student_personal_infoModel.js';
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
import { authenticate } from '../middlewares/auth.js';

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
};

// Route to filter student profiles
router.get('/students', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const {
      department,
      batch_no,
      class_division,
      sgpi_min,
      sgpi_max,
      gender,
      email,
      prn,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (department) query.department = { $in: department.split(',') };
    if (batch_no) query.batch_no = Number(batch_no);
    if (class_division) query.class_division = class_division;
    if (sgpi_min || sgpi_max) {
      query.current_sgpi = {};
      if (sgpi_min) query.current_sgpi.$gte = Number(sgpi_min);
      if (sgpi_max) query.current_sgpi.$lte = Number(sgpi_max);
    }
    if (gender) query.gender = gender;
    if (email) query.email_id = { $regex: email, $options: 'i' };
    if (prn) query.prn = { $regex: prn, $options: 'i' };

    const students = await PersonalInfo.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('email_id prn first_name last_name department batch_no class_division current_sgpi gender');

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



router.get('/activities', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const {
      activity_type,
      email_id,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = req.query;

    // Build base query
    const query = {};
    if (email_id) query.email_id = { $in: email_id.split(',') };

    // Status filtering - fixed $exists usage
    if (status) {
      if (status === 'pending') {
        query.$or = [
          { 'proof.fileName': null }, // Changed from $exists: false
          { end_date: null }
        ];
      } else if (status === 'completed') {
        query['proof.fileName'] = { $ne: null }; // Changed from $exists: true
        query.end_date = { $ne: null };
      }
    }

    // Date range filtering
    if (start_date || end_date) {
      query.$or = [];
      if (start_date) {
        query.$or.push(
          { start_date: { $gte: new Date(start_date) } },
          { date: { $gte: new Date(start_date) } },
          { date_of_publication: { $gte: new Date(start_date) } }
        );
      }
      if (end_date) {
        query.$or.push(
          { end_date: { $lte: new Date(end_date) } },
          { date: { $lte: new Date(end_date) } },
          { date_of_publication: { $lte: new Date(end_date) } }
        );
      }
    }

    let activities = [];
    let total = 0;
    let total_completed = 0;
    let total_pending = 0;
    let unique_students_count = 0;

    if (activity_type === 'All') {
      // Main pipeline for all activity types
      const basePipeline = [
        { $match: query },
        { 
          $addFields: { 
            activity_type: 'Internship',
            sort_date: {
              $ifNull: [
                '$start_date',
                { $ifNull: [
                  '$date',
                  { $ifNull: [
                    '$date_of_publication',
                    '$createdAt'
                  ]}
                ]}
              ]
            }
          } 
        },
        { $project: { 'proof.data': 0 } }
      ];

      // Create union pipelines for other activity types
      const unionPipelines = Object.keys(activityModels)
        .filter(type => type !== 'Internship')
        .map(type => ({
          $unionWith: {
            coll: activityModels[type].collection.name,
            pipeline: [
              { $match: query },
              { $addFields: { activity_type: type } },
              { 
                $addFields: {
                  sort_date: {
                    $ifNull: [
                      '$start_date',
                      { $ifNull: [
                        '$date',
                        { $ifNull: [
                          '$date_of_publication',
                          '$createdAt'
                        ]}
                      ]}
                    ]
                  }
                }
              },
              { $project: { 'proof.data': 0 } }
            ]
          }
        }));

      // Full pipeline with pagination and sorting
      const fullPipeline = [
        ...basePipeline,
        ...unionPipelines,
        { $sort: { sort_date: -1 } }, // Newest first
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) }
      ];

      // Count pipeline for total documents
      const countPipeline = [
        ...basePipeline,
        ...unionPipelines,
        { $count: 'total' }
      ];

      // Stats pipeline for counts
      const statsPipeline = [
        ...basePipeline,
        ...unionPipelines,
        {
          $facet: {
            status_counts: [
              { 
                $addFields: {
                  is_completed: {
                    $and: [
                      { $ne: ['$proof.fileName', null] },
                      { $ne: ['$end_date', null] }
                    ]
                  }
                }
              },
              {
                $group: {
                  _id: null,
                  total_completed: { $sum: { $cond: ['$is_completed', 1, 0] } },
                  total_pending: { $sum: { $cond: ['$is_completed', 0, 1] } }
                }
              }
            ],
            unique_students: [
              { $group: { _id: '$email_id' } },
              { $count: 'total' }
            ]
          }
        }
      ];

      // Execute all pipelines
      const [activitiesResult, countResult, statsResult] = await Promise.all([
        Internship.aggregate(fullPipeline),
        Internship.aggregate(countPipeline),
        Internship.aggregate(statsPipeline)
      ]);

      activities = activitiesResult;
      total = countResult.length > 0 ? countResult[0].total : 0;
      total_completed = statsResult[0]?.status_counts[0]?.total_completed || 0;
      total_pending = statsResult[0]?.status_counts[0]?.total_pending || 0;
      unique_students_count = statsResult[0]?.unique_students[0]?.total || 0;

    } else {
      // Single activity type handling
      const Model = activityModels[activity_type];
      if (!Model) return res.status(400).json({ message: 'Invalid activity type' });

      // Get paginated results sorted by date (newest first)
      activities = await Model.find(query)
        .sort({ 
          start_date: -1, 
          date: -1, 
          date_of_publication: -1,
          createdAt: -1 
        })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .select('-proof.data')
        .lean()
        .exec();

      // Get counts and stats
      const [totalCount, completedCount, pendingCount, uniqueStudents] = await Promise.all([
        Model.countDocuments(query),
        Model.countDocuments({ ...query, 'proof.fileName': { $ne: null }, end_date: { $ne: null } }),
        Model.countDocuments({
          $or: [
            { ...query, 'proof.fileName': null },
            { ...query, end_date: null }
          ]
        }),
        Model.distinct('email_id', query)
      ]);

      activities = activities.map(a => ({ ...a, activity_type }));
      total = totalCount;
      total_completed = completedCount;
      total_pending = pendingCount;
      unique_students_count = uniqueStudents.length;
    }

    // Add status field to each activity
    const finalActivities = activities.map((a) => {
      const hasProof = a.proof?.fileName;
      const hasValidEndDate = a.end_date !== null && a.end_date !== undefined;
      const status = hasProof && hasValidEndDate ? 'Completed' : 'Pending';
      return { ...a, status };
    });

    res.json({
      activities: finalActivities,
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
router.get('/activities/proof/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
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

// New route to download all filtered activities as CSV
router.get('/activities/download', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { activity_type, email_id, status, start_date, end_date } = req.query;

    const query = {};
    if (email_id) query.email_id = { $in: email_id.split(',') };
    if (status) {
      if (status === 'pending') {
        query.$or = [{ 'proof.fileName': { $exists: false } }, { end_date: null }];
      } else if (status === 'completed') {
        query['proof.fileName'] = { $exists: true };
        query.end_date = { $ne: null };
      }
    }
    if (start_date || end_date) {
      query.$or = [];
      if (start_date) {
        query.$or.push(
          { start_date: { $gte: new Date(start_date) } },
          { date: { $gte: new Date(start_date) } },
          { date_of_publication: { $gte: new Date(start_date) } }
        );
      }
      if (end_date) {
        query.$or.push(
          { end_date: { $lte: new Date(end_date) } },
          { date: { $lte: new Date(end_date) } },
          { date_of_publication: { $lte: new Date(end_date) } }
        );
      }
    }

    let activities = [];

    if (activity_type === 'All') {
      const pipeline = [
        { $match: query },
        { $addFields: { activity_type: 'Internship' } },
        {
          $addFields: {
            sort_date: {
              $ifNull: ['$start_date', { $ifNull: ['$date', '$date_of_publication'] }],
            },
            status: {
              $cond: {
                if: { $and: [{ $ifNull: ['$proof.fileName', false] }, { $ne: ['$end_date', null] }] },
                then: 'Completed',
                else: 'Pending',
              },
            },
          },
        },
        { $project: { 'proof.data': 0 } },
      ];

      const unionPipelines = Object.keys(activityModels)
        .filter((type) => type !== 'Internship')
        .map((type) => ({
          $unionWith: {
            coll: activityModels[type].collection.name,
            pipeline: [
              { $match: query },
              { $addFields: { activity_type: type } },
              {
                $addFields: {
                  sort_date: {
                    $ifNull: ['$start_date', { $ifNull: ['$date', '$date_of_publication'] }],
                  },
                  status: {
                    $cond: {
                      if: { $and: [{ $ifNull: ['$proof.fileName', false] }, { $ne: ['$end_date', null] }] },
                      then: 'Completed',
                      else: 'Pending',
                    },
                  },
                },
              },
              { $project: { 'proof.data': 0 } },
            ],
          },
        }));

      const fullPipeline = [
        ...pipeline,
        ...unionPipelines,
        { $sort: { sort_date: 1 } },
      ];

      activities = await Internship.aggregate(fullPipeline);
    } else {
      const Model = activityModels[activity_type];
      if (!Model) {
        return res.status(400).json({ message: 'Invalid activity type' });
      }

      activities = await Model.find(query)
        .sort({ start_date: 1, date: 1, date_of_publication: 1 })
        .select('-proof.data')
        .lean()
        .exec();
      activities = activities.map((activity) => ({
        ...activity,
        activity_type,
        status: activity.proof?.fileName && activity.end_date ? 'Completed' : 'Pending',
        sort_date: activity.start_date || activity.date || activity.date_of_publication,
      }));
    }

    res.json({ activities });
  } catch (error) {
    console.error('Error downloading activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to filter ContactUs submissions
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