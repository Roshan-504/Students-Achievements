import xlsx from 'xlsx';
import PersonalInfo from '../models/student_personal_infoModel.js';
import faculty_profiles from '../models/faculty_profiles.js';
// import Student from '../models/Student.js';
// import Faculty from '../models/Faculty';

/**
 * Processes Excel buffer and validates data
 * @param {Buffer} buffer - Excel file buffer
 * @param {'students'|'faculty'} type - Data type to process
 */
export const processExcelData = async (buffer, type) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Common validation
  if (!jsonData.length) throw new Error('Excel file is empty');
  
  if (type === 'students') {
    // Student-specific validation
    const validatedData = jsonData.map(row => {
      if (!row['Email ID']?.endsWith('@ves.ac.in')) {
        throw new Error(`Invalid email: ${row['Email ID']}`);
      }
      
      return {
        email_id: row['Email ID'].toLowerCase(),
        prn: row['PRN'],
        first_name: row['First Name'],
        last_name: row['Last Name'],
        department: row['Department'].toUpperCase(),
        batch_no: parseInt(row['Batch']),
        current_sgpi: row['SGPI'] ? parseFloat(row['SGPI']) : null
      };
    });

    await PersonalInfo.insertMany(validatedData);
    return { count: validatedData.length };

  } else if (type === 'faculty') {
    // Faculty-specific validation
    const validatedData = jsonData.map(row => ({
      email_id: row['Email ID'].toLowerCase(),
      name: row['Name'],
      department: row['Department'],
      designation: row['Designation'],
      contact_no: row['Contact Number'] || null
    }));

    await faculty_profiles.insertMany(validatedData);
    return { count: validatedData.length };
  }

  throw new Error('Invalid data type specified');
};