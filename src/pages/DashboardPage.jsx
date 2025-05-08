import { useEffect, useState } from 'react';
import api from '../api/api';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/user/');
        setUser(res.data);
      } catch {
        setMessage('Failed to load user info.');
      }
    };
    fetchUser();
  }, []);

  const handleUpload = async (url) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('✅ File uploaded successfully.');
    } catch (err) {
      setMessage('❌ Upload failed.');
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
          <label className="block">
            <span className="text-gray-700 font-medium">
              {user.role === 'candidate' ? 'Upload Resume' : 'Upload Job Description'}
            </span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </label>

          <button
            onClick={() =>
              handleUpload(user.role === 'candidate' ? '/api/upload-resume/' : '/api/upload-jd/')
            }
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