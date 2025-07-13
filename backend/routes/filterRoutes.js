import express from 'express';
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

// Route to filter activities
router.get('/activities', authenticate, async (req, res) => {
  try {

    const {
      activity_type,
      email_id,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = req.query;

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
    let total = 0;

    if (activity_type === 'All') {
      const pipelines = Object.values(activityModels).map((Model) => ({
        $match: query,
      }));

      const results = await Promise.all(
        Object.entries(activityModels).map(async ([type, Model]) => {
          const docs = await Model.aggregate([
            { $match: query },
            { $addFields: { activity_type: type } },
            { $skip: (page - 1) * limit },
            { $limit: Number(limit) },
            { $project: { 'proof.data': 0 } },
          ]);
          const count = await Model.countDocuments(query);
          return { docs, count };
        })
      );

      activities = results.flatMap((result) => result.docs);
      total = results.reduce((sum, result) => sum + result.count, 0);

      // Sort activities by date to ensure consistent ordering
      activities.sort((a, b) =>
        new Date(a.start_date || a.date || a.date_of_publication).getTime() -
        new Date(b.start_date || b.date || b.date_of_publication).getTime()
      );

      // Apply pagination after union
      activities = activities.slice(0, Number(limit));
    } else {
      const Model = activityModels[activity_type];
      if (!Model) {
        return res.status(400).json({ message: 'Invalid activity type' });
      }

      activities = await Model.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('-proof.data')
        .lean()
        .exec();
      activities = activities.map((activity) => ({ ...activity, activity_type }));
      total = await Model.countDocuments(query);
    }

    res.json({
      activities,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to download proof
router.get('/activities/proof/:id', authenticate, async (req, res) => {
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

// Route to filter ContactUs submissions
router.get('/contacts', authenticate, async (req, res) => {
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