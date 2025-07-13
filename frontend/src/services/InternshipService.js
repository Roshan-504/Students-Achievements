import axiosInstance from './axiosInstance'; // Import your existing axiosInstance

const API_URL = '/api/internships';

export const getInternships = async () => {
  const response = await axiosInstance.get('/student/internships');
  return response.data;
};

export const createInternship = async (internshipData) => {
  // Prepare form data for file upload
  const formData = new FormData();
  
  // Append all fields
  Object.entries(internshipData).forEach(([key, value]) => {
    if (key === 'certificate_file' && value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, value);
    }
  });

  const response = await axiosInstance.post('/student/upload/internship', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateInternship = async (id, internshipData) => {
  // Prepare form data for file upload
  const formData = new FormData();
  
  // Append all fields
  Object.entries(internshipData).forEach(([key, value]) => {
    if (key === 'certificate_file' && value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, value);
    }
  });

  const response = await axiosInstance.put(`/internship/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteInternship = async (id) => {
  const response = await axiosInstance.delete(`/internship/${id}`);
  return response.data;
};