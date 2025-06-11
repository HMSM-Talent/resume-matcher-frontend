import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile, getSimilarityScores } from '../api/api';
import '../styles/Dashboard.css';

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

  if (loading) return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="error-message">{error}</div>
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="error-message">No user data available</div>
        </div>
      </div>
    </div>
  );

  const totalJobs = similarJobs.length;
  const averageScore = similarJobs.length > 0
    ? (similarJobs.reduce((acc, curr) => acc + curr.score, 0) / similarJobs.length * 100).toFixed(1)
    : 0;
  const topMatches = similarJobs.filter(j => j.score >= 0.8).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>{user.first_name ? `${user.first_name}'s Dashboard` : 'Candidate Dashboard'}</h2>
            <p>Welcome back!</p>
          </div>
          
          <div className="sidebar-menu">
            <button className="active">
              <span>📊 Overview</span>
            </button>
            <button onClick={() => navigate('/jobs')}>
              <span>🔍 Job Search</span>
            </button>
            <button onClick={() => navigate('/upload-resume')}>
              <span>📝 Upload Resume</span>
            </button>
            <button onClick={() => setIsEditing(!isEditing)}>
              <span>⚙️ Edit Profile</span>
            </button>
            <button onClick={() => {
              localStorage.clear();
              navigate('/');
            }}>
              <span>🚪 Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Job Matches Overview</h1>
            {isEditing && (
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel Editing
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Job Matches</h3>
              <div className="value">{totalJobs}</div>
            </div>
            <div className="stat-card">
              <h3>Average Match Score</h3>
              <div className="value">{averageScore}%</div>
            </div>
            <div className="stat-card">
              <h3>Top Matches (80%+)</h3>
              <div className="value">{topMatches}</div>
            </div>
          </div>

          {/* Profile Edit Form */}
          {isEditing && (
            <div className="filters-section">
              <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="filter-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="phone_number">Phone Number</label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Filters Section */}
          <div className="filters-section">
            <h3 className="text-lg font-semibold mb-4">Filter Jobs</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="jobType">Job Type</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Job Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={filters.experienceLevel}
                  onChange={handleFilterChange}
                >
                  <option value="">All Experience Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead Level</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="minScore">Minimum Match Score</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    id="minScore"
                    name="minScore"
                    min="0"
                    max="1"
                    step="0.1"
                    value={filters.minScore}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">{(filters.minScore * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="filter-group">
                <label htmlFor="sortBy">Sort By</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="score">Match Score</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="results-list">
            <h2 className="text-xl font-semibold mb-4">Top Matching Jobs</h2>
            {!filteredAndSortedJobs || filteredAndSortedJobs.length === 0 ? (
              <div className="result-card">
                <p className="text-gray-600">No matches found yet. Please upload your resume.</p>
              </div>
            ) : (
              filteredAndSortedJobs.map((item) => (
                <div key={item.id} className="result-card">
                  <div className="result-header">
                    <div>
                      <h3 className="result-title">{item.job_description?.title || 'Untitled Position'}</h3>
                      <div className="result-meta">
                        <span>{item.job_description?.company_name}</span>
                        <span>•</span>
                        <span>{item.job_description?.location}</span>
                        <span>•</span>
                        <span>Type: {item.job_description?.job_type || 'Not specified'}</span>
                        <span>•</span>
                        <span>Experience: {item.job_description?.experience_level || 'Not specified'}</span>
                      </div>
                    </div>
                    <div className="result-score">
                      {(item.score * 100).toFixed(1)}% Match
                    </div>
                  </div>
                  <div className="result-details">
                    <p className="text-sm text-gray-500 mb-2">
                      Posted: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    {item.job_description?.file && (
                      <button
                        onClick={() => {
                          const fileUrl = item.job_description.file.startsWith('http')
                            ? item.job_description.file
                            : `${process.env.REACT_APP_API_URL || ''}${item.job_description.file}`;
                          window.open(fileUrl, '_blank');
                        }}
                        className="btn btn-secondary"
                      >
                        View Job Description
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CandidateDashboard;