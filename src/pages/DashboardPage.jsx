import { useEffect, useState } from 'react';
import { uploadResume, uploadJobDescription } from '../api/api';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/accounts/me/');
        setUser(res.data);
      } catch {
        setMessage('Failed to load user info.');
      }
    };
    fetchUser();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setMessage('❌ Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (user.role === 'candidate') {
      if (title) formData.append('title', title);
      if (skills) formData.append('skills', skills);
    } else {
      // For job descriptions, title is required
      if (!title) {
        setMessage('❌ Job title is required.');
        return;
      }
      formData.append('title', title);
      formData.append('company_name', user.company_name);
      formData.append('location', user.location || '');
      formData.append('job_type', user.job_type || 'full-time');
      formData.append('experience_level', user.experience_level || 'mid');
      formData.append('required_skills', skills);
    }

    try {
      const response = user.role === 'candidate' 
        ? await uploadResume(formData)
        : await uploadJobDescription(formData);
      
      setMessage('✅ File uploaded successfully.');
      setFile(null);
      setTitle('');
      setSkills('');
    } catch (err) {
      setMessage('❌ Upload failed: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.email}</h2>
      <p className="mb-6 text-gray-600">Logged in as: <span className="font-semibold">{user.role}</span></p>

      {(user.role === 'candidate' || user.role === 'company') && (
        <div className="space-y-4">
          <div className="form-group">
            <label className="text-gray-700 font-medium">
              {user.role === 'candidate' ? 'Resume Title' : 'Job Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              placeholder={user.role === 'candidate' ? 'Enter resume title' : 'Enter job title'}
            />
          </div>

          <div className="form-group">
            <label className="text-gray-700 font-medium">
              {user.role === 'candidate' ? 'Skills' : 'Required Skills'}
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              placeholder="Enter skills (comma-separated)"
            />
          </div>

          <div className="form-group">
            <label className="text-gray-700 font-medium">
              {user.role === 'candidate' ? 'Upload Resume' : 'Upload Job Description'}
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              accept=".pdf,.docx"
            />
            <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, DOCX (max 10MB)</p>
          </div>

          <button
            onClick={handleUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Upload File
          </button>

          {message && (
            <p className={`mt-2 text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;