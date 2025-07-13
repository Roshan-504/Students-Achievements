import { useState } from 'react';
import api from '../services/axiosInstance';
import { useAuthStore } from '../context/authStore';

export default function AdminUploadForm() {
  const [uploadType, setUploadType] = useState('students');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const { user,logout } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = `admin/upload/${uploadType}`;
      const { data } = await api.post(endpoint, formData);
      
      setResult({
        success: true,
        message: data.message
      });
      setFile(null);

    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.error || 'Upload failed'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Bulk Upload</h2>
        <button 
              onClick={logout}
              className="bg-white text-[#2A447E] px-3 py-1 rounded hover:bg-gray-200"
        >Logout
        </button>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Type
          </label>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="students">Students Data</option>
            <option value="faculty">Faculty Data</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Excel File
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum file size: 5MB
          </p>
        </div>

        <button
          type="submit"
          disabled={isUploading || !file}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? 'Processing...' : 'Upload Data'}
        </button>

        {result && (
          <div className={`p-3 rounded ${
            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result.message}
          </div>
        )}
      </form>

      <div className="mt-6 border-t pt-4">
        <h3 className="font-medium mb-2">Template Requirements:</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>First row must contain column headers</li>
          {uploadType === 'students' ? (
            <>
              <li>Required columns: PRN, Email ID, First Name, Department, Batch</li>
              <li>Email must end with @ves.ac.in</li>
            </>
          ) : (
            <>
              <li>Required columns: Email ID, Name, Department, Designation</li>
              <li>Contact Number is optional</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}