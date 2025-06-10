import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile, getSimilarityScores } from '../api/api';
import '../styles/Dashboard.css';

function CompanyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [similarCandidates, setSimilarCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    experienceLevel: '',
    minScore: 0,
  });
  const [sortBy, setSortBy] = useState('score');
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone_number: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getCurrentUser();
        setUser(userRes.data);
        setFormData({
          company_name: userRes.data.company_name || '',
          email: userRes.data.email || '',
          phone_number: userRes.data.phone_number || ''
        });

        try {
          const scoreRes = await getSimilarityScores();
          console.log('Similarity scores response:', scoreRes.data);
          if (scoreRes.data.results && scoreRes.data.results.length > 0) {
            console.log('First candidate data structure:', scoreRes.data.results[0]);
          }
          setSimilarCandidates(Array.isArray(scoreRes.data.results) ? scoreRes.data.results : []);
        } catch (scoreErr) {
          console.error('Failed to fetch similarity scores:', scoreErr);
          console.error('Error details:', scoreErr.response?.data);
          setSimilarCandidates([]);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
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

  const filteredAndSortedCandidates = similarCandidates
    .filter(candidate => {
      const expLevel = candidate.resume?.experience_level?.toLowerCase();
      const filterExpLevel = filters.experienceLevel?.toLowerCase();
      if (filterExpLevel && expLevel !== filterExpLevel) return false;
      
      if (filters.minScore > 0 && candidate.score < filters.minScore) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      }
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

  const totalCandidates = similarCandidates.length;
  const averageScore = similarCandidates.length > 0
    ? (similarCandidates.reduce((acc, curr) => acc + curr.score, 0) / similarCandidates.length * 100).toFixed(1)
    : 0;
  const topMatches = similarCandidates.filter(c => c.score >= 0.8).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>{user.company_name || 'Company Dashboard'}</h2>
            <p>Welcome back!</p>
          </div>
          
          <div className="sidebar-menu">
            <button className="active">
              <span>📊 Overview</span>
            </button>
            <button onClick={() => navigate('/upload-jd')}>
              <span>📝 Upload Job Description</span>
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
            <h1>Company Overview</h1>
            {isEditing && (
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel Editing
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Candidates</h3>
              <div className="value">{totalCandidates}</div>
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
              <h3 className="text-lg font-semibold mb-4">Edit Company Profile</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="filter-group">
                  <label htmlFor="company_name">Company Name</label>
                  <input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Enter company name"
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
            <h3 className="text-lg font-semibold mb-4">Filter Candidates</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={filters.experienceLevel}
                  onChange={handleFilterChange}
                >
                  <option value="">All Experience Levels</option>
                  <option value="ENTRY">Entry Level</option>
                  <option value="MID">Mid Level</option>
                  <option value="SENIOR">Senior Level</option>
                  <option value="LEAD">Lead Level</option>
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
            <h2 className="text-xl font-semibold mb-4">Top Matching Candidates</h2>
            {!filteredAndSortedCandidates || filteredAndSortedCandidates.length === 0 ? (
              <div className="result-card">
                <p className="text-gray-600">No matches found yet. Please upload a job description.</p>
              </div>
            ) : (
              filteredAndSortedCandidates.map((item) => {
                const candidateName = item.resume?.user?.first_name && item.resume?.user?.last_name
                  ? `${item.resume.user.first_name} ${item.resume.user.last_name}`
                  : 'Anonymous Candidate';
                
                return (
                  <div key={item.id} className="result-card">
                    <div className="result-header">
                      <div>
                        <h3 className="result-title">{candidateName}</h3>
                        <div className="result-meta">
                          <span>{item.resume?.user?.email || 'Email not available'}</span>
                          <span>•</span>
                          <span>Experience: {item.resume?.experience_level?.replace('_', ' ').toUpperCase() || 'Not specified'}</span>
                          <span>•</span>
                          <span>Skills: {item.resume?.skills || 'Not specified'}</span>
                        </div>
                      </div>
                      <div className="result-score">
                        {(item.score * 100).toFixed(1)}% Match
                      </div>
                    </div>
                    <div className="result-details">
                      <p className="text-sm text-gray-500 mb-2">
                        Uploaded: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      {item.resume?.file && (
                        <button
                          onClick={() => {
                            const fileUrl = item.resume.file.startsWith('http')
                              ? item.resume.file
                              : `${process.env.REACT_APP_API_URL || ''}${item.resume.file}`;
                            window.open(fileUrl, '_blank');
                          }}
                          className="btn btn-secondary"
                        >
                          View Resume
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CompanyDashboard;