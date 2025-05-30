import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile, getSimilarityScores } from '../api/api';

function CandidateDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getCurrentUser();
        setUser(userRes.data);
        setFormData({
          first_name: userRes.data.first_name || '',
          last_name: userRes.data.last_name || '',
          email: userRes.data.email || '',
          phone_number: userRes.data.phone_number || ''
        });

        const scoreRes = await getSimilarityScores();
        setSimilarJobs(scoreRes.data);
      } catch (err) {
        setError('Failed to load user or matches.');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      <div className="max-w-3xl mx-auto bg-white p-6 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user.first_name}</h1>
        <p className="mb-4 text-gray-700">Role: <strong>Candidate</strong></p>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>

        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-6">
            <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" className="w-full border px-3 py-2 rounded" />
            <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" className="w-full border px-3 py-2 rounded" />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full border px-3 py-2 rounded" />
            <input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" className="w-full border px-3 py-2 rounded" />
            <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Save Changes</button>
          </form>
        )}

        <button
          onClick={() => navigate('/upload-resume')}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go to Upload Resume
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

        <hr className="my-6" />
        <h2 className="text-xl font-semibold mb-3">Top Matching Job Descriptions</h2>
        {similarJobs.length === 0 ? (
          <p>No matches found yet. Please upload a resume.</p>
        ) : (
          <ul className="space-y-4">
            {similarJobs.map((item) => (
              <li key={item.id} className="p-4 border rounded shadow-sm bg-gray-100">
                <p className="font-bold text-lg">{item.job_description.title || 'Untitled Position'}</p>
                <p className="text-gray-700">
                  {item.job_description.company_name} – {item.job_description.location}
                </p>
                <p className="text-sm text-gray-500">
                  Match Score: <strong>{(item.score * 100).toFixed(1)}%</strong>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CandidateDashboard;