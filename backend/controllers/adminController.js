import { processExcelData } from '../utils/excelProcessor.js';

export const uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await processExcelData(req.file.buffer, 'students');
    res.json({
      success: true,
      message: `${result.count} students added successfully`
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
      message: `${result.count} faculty members added successfully`
    });

  } catch (error) {
    res.status(400).json({
      details: error.errors
    });
  }
};
