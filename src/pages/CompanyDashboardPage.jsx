import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile } from '../api/api';

function CompanyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone_number: '',
    company_name: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
        setFormData({
          email: response.data.email || '',
          phone_number: response.data.phone_number || '',
          company_name: response.data.company_name || '',
        });
      } catch (err) {
        setError('Failed to load user data');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUserProfile(formData);
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      setError('Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user.company_name || user.email}</h1>
        <p className="mb-4 text-gray-700">Role: <strong>Company</strong></p>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>

        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-6">
            <input
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full border px-3 py-2 rounded"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </form>
        )}

        <button
          onClick={() => navigate('/upload-jd')}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go to Upload Job Description
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Sign out
        </button>

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default CompanyDashboard;