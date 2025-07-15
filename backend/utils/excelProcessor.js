import xlsx from 'xlsx';
import student_profile from '../models/student_profileModel.js';
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

  if (!jsonData.length) throw new Error('Excel file is empty');

  if (type === 'students') {
    const validatedData = jsonData.map(row => {
      const email = row['Email ID']?.toLowerCase();
      if (!email || !email.endsWith('@ves.ac.in')) {
        throw new Error(`Invalid or missing email: ${row['Email ID']}`);
      }

      return {
        email_id: email,
        prn: row['PRN'] || undefined,
        first_name: row['First Name'] || undefined,
        middle_name: row['Middle Name'] || undefined,
        last_name: row['Last Name'] || undefined,
        mother_name: row['Mother\'s Name'] || undefined,
        department: row['Department']?.toUpperCase() || undefined,
        batch_no: row['Batch'] ? parseInt(row['Batch']) : undefined,
        division: row['Division'] || undefined,
        gender: row['Gender'] || undefined,
        abc_id: row['ABC ID'] || undefined,
        average_sgpi: row['SGPI'] ? parseFloat(row['SGPI']) : undefined,
        phone: row['Phone'] || undefined,
        linkedin_url: row['LinkedIn URL'] || undefined,
        other_urls: row['Other URLs']
          ? row['Other URLs'].split(',').map(url => url.trim())
          : undefined,
        last_updated: row['Last Updated'] ? new Date(row['Last Updated']) : new Date()
      };
    });

    await student_profile.insertMany(validatedData);
    return { count: validatedData.length };
  }

  if (type === 'faculty') {
    const validatedData = jsonData.map(row => {
      const email = row['Email ID']?.toLowerCase();
      if (!email || !email.endsWith('@ves.ac.in')) {
        throw new Error(`Invalid or missing email: ${row['Email ID']}`);
      }

      return {
        email_id: email,
        name: row['Name'] || undefined,
        department: row['Department'] || undefined,
        designation: row['Designation'] || undefined,
        contact_no: row['Contact Number'] || undefined
      };
    });

    await faculty_profiles.insertMany(validatedData);
    return { count: validatedData.length };
  }

  throw new Error('Invalid data type specified');
};
