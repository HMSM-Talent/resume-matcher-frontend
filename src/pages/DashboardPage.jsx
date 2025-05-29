<<<<<<< Updated upstream
import { useEffect, useState } from 'react';
import api from '../api/api';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
=======
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile } from '../api/api';

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
>>>>>>> Stashed changes

  useEffect(() => {
    const fetchUser = async () => {
      try {
<<<<<<< Updated upstream
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
=======
        const response = await getCurrentUser();
        setUser(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
        });
      } catch (err) {
        setError('Failed to load user data');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await updateUserProfile(formData);
      setUser(response.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-[#4B5563]">Loading...</div>
>>>>>>> Stashed changes
      </div>
    );
  }

  return (
<<<<<<< Updated upstream
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
=======
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#111827] mb-2">
                Welcome, {user?.first_name || user?.email}
              </h1>
              <p className="text-[#4B5563]">Logged in as: {user?.role}</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#D1D5DB] transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#EF4444] rounded-lg text-[#EF4444] text-sm mb-6">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent bg-white text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent bg-white text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent bg-white text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent bg-white text-[#111827]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111827] text-white py-2 px-4 rounded-lg hover:bg-[#1F2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {user?.role === 'candidate' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1">
                      Upload Resume
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="w-full px-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent bg-white text-[#111827] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#111827] file:text-white hover:file:bg-[#1F2937]"
                    />
                    <p className="mt-1 text-sm text-[#4B5563]">Supported formats: PDF, DOCX (max 10MB)</p>
                  </div>

                  <button className="w-full bg-[#111827] text-white py-2 px-4 rounded-lg hover:bg-[#1F2937] transition-colors">
                    Upload
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              navigate('/');
            }}
            className="mt-6 px-4 py-2 bg-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#D1D5DB] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
>>>>>>> Stashed changes
    </div>
  );
}

export default DashboardPage;