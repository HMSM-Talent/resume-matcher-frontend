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
  const [filters, setFilters] = useState({
    jobType: '',
    experienceLevel: '',
    minScore: 0,
  });
  const [sortBy, setSortBy] = useState('score');
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

        try {
          const scoreRes = await getSimilarityScores();
          console.log('Similarity scores response:', scoreRes.data);
          setSimilarJobs(Array.isArray(scoreRes.data.results) ? scoreRes.data.results : []);
        } catch (scoreErr) {
          console.error('Failed to fetch similarity scores:', scoreErr);
          console.error('Error details:', scoreErr.response?.data);
          setSimilarJobs([]);
        }
      } catch (err) {
        setError('Failed to load user data.');
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const filteredAndSortedJobs = similarJobs
    .filter(job => {
      if (filters.jobType && job.job_description?.job_type !== filters.jobType) return false;
      if (filters.experienceLevel && job.job_description?.experience_level !== filters.experienceLevel) return false;
      if (filters.minScore > 0 && job.score < filters.minScore) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div>No user data available</div>;

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

        <hr className="my-6" />

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Filter Jobs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="border rounded p-2"
            >
              <option value="">All Job Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            <select
              name="experienceLevel"
              value={filters.experienceLevel}
              onChange={handleFilterChange}
              className="border rounded p-2"
            >
              <option value="">All Experience Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead Level</option>
            </select>

            <div className="flex items-center gap-2">
              <label>Min Score:</label>
              <input
                type="range"
                name="minScore"
                min="0"
                max="1"
                step="0.1"
                value={filters.minScore}
                onChange={handleFilterChange}
                className="w-full"
              />
              <span>{(filters.minScore * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="mr-2">Sort by:</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="border rounded p-2"
            >
              <option value="score">Score</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-3">Top Matching Job Descriptions</h2>
        {!filteredAndSortedJobs || filteredAndSortedJobs.length === 0 ? (
          <p>No matches found yet. Please upload a resume.</p>
        ) : (
          <ul className="space-y-4">
            {filteredAndSortedJobs.map((item) => (
              <li key={item.id} className="p-4 border rounded shadow-sm bg-gray-100">
                <p className="font-bold text-lg">{item.job_description?.title || 'Untitled Position'}</p>
                <p className="text-gray-700">
                  {item.job_description?.company_name} – {item.job_description?.location}
                </p>
                <p className="text-sm text-gray-500">
                  Job Type: {item.job_description?.job_type || 'Not specified'} • 
                  Experience: {item.job_description?.experience_level || 'Not specified'}
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