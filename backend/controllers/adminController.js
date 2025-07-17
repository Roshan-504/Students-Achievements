import student_profile from '../models/student_profileModel.js';
import { processExcelData } from '../utils/excelProcessor.js';

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
    const { division, department, batch_no } = req.query;

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

    // Get students with selected fields (excluding sensitive/irrelevant fields if needed)
    const students = await student_profile.find(query).sort({
      last_name: 1
    });

    res.json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('Error in /students/filter:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
