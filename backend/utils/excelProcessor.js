import xlsx from 'xlsx';
import student_profile from '../models/student_profileModel.js';
import faculty_profiles from '../models/faculty_profiles.js';

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

  let count = 0;

  if (type === 'students') {
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 2; // Excel row number (accounting for headers)

      const email = row['Email ID']?.toLowerCase()?.trim();
      const division = row['Division']?.trim();
      const department = row['Department']?.trim();
      const batch = row['Batch'];

      // Required fields validation
      if (!email || !email.endsWith('@ves.ac.in')) throw new Error(`Row ${rowNum}: Invalid or missing 'Email ID'`);
      if (!division) throw new Error(`Row ${rowNum}: Missing 'Division'`);
      if (!department) throw new Error(`Row ${rowNum}: Missing 'Department'`);
      if (!batch) throw new Error(`Row ${rowNum}: Missing 'Batch'`);

      const studentData = {
        email_id: email,
        prn: row['PRN'] || null,
        first_name: row['First Name'] || null,
        middle_name: row['Middle Name'] || null,
        last_name: row['Last Name'] || null,
        mother_name: row["Mother's Name"] || null,
        department: department.toUpperCase(),
        batch_no: parseInt(batch),
        division: division,
        gender: row['Gender'] || null,
        abc_id: row['ABC ID'] || null,
        average_sgpi: row['SGPI'] ? parseFloat(row['SGPI']) : null,
        phone: row['Phone'] || null,
        linkedin_url: row['LinkedIn URL'] || null,
        other_urls: row['Other URLs']
          ? row['Other URLs'].split(',').map(url => url.trim())
          : [],
      };

      const result = await student_profile.findOneAndUpdate(
        { email_id: email },
        studentData,
        { upsert: true, new: true, }
      );
      count++;
    }

    return { count };
  }

  if (type === 'faculty') {
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 2;

      const email = row['Email ID']?.toLowerCase()?.trim();
      if (!email || !email.endsWith('@ves.ac.in')) throw new Error(`Row ${rowNum}: Invalid or missing 'Email ID'`);

      const facultyData = {
        email_id: email,
        name: row['Name'] || null,
        department: row['Department'] || null,
        designation: row['Designation'] || null,
        contact_no: row['Contact Number'] || null
      };

      const result = await faculty_profiles.findOneAndUpdate(
        { email_id: email },
        facultyData,
        { upsert: true, new: true }
      );

      count++;
    }

    return { count };
  }

  throw new Error('Invalid data type specified');
};
