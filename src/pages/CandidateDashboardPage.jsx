import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile, getSimilarityScores, getJobDescription } from '../api/api';
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
  const [jobDetails, setJobDetails] = useState({});

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
          const jobs = Array.isArray(scoreRes.data.results) ? scoreRes.data.results : [];
          setSimilarJobs(jobs);

          // Fetch job description details for each job
          const jobDetailsPromises = jobs.map(async (job) => {
            try {
              const jobRes = await getJobDescription(job.job_description);
              return { [job.job_description]: jobRes.data };
            } catch (err) {
              console.error(`Failed to fetch job description ${job.job_description}:`, err);
              return { [job.job_description]: null };
            }
          });

          const jobDetailsResults = await Promise.all(jobDetailsPromises);
          const jobDetailsMap = jobDetailsResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          setJobDetails(jobDetailsMap);
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
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const filteredAndSortedJobs = similarJobs
    .filter(job => {
      const jobDetail = jobDetails[job.job_description];
      if (!jobDetail) return false;
      
      // Convert job type to lowercase for case-insensitive comparison
      const jobType = jobDetail.job_type?.toLowerCase();
      const filterJobType = filters.jobType?.toLowerCase();
      if (filterJobType && jobType !== filterJobType) return false;
      
      // Convert experience level to lowercase for case-insensitive comparison
      const expLevel = jobDetail.experience_level?.toLowerCase();
      const filterExpLevel = filters.experienceLevel?.toLowerCase();
      if (filterExpLevel && expLevel !== filterExpLevel) return false;
      
      if (filters.minScore > 0 && job.score < filters.minScore) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'date') {
        const dateA = new Date(jobDetails[a.job_description]?.created_at || 0);
        const dateB = new Date(jobDetails[b.job_description]?.created_at || 0);
        return dateB - dateA;
      }
      return 0;
    });

  if (loading) return <div className="loading">Loading...</div>;
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
        <div className="dashboard-main">
          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-header">
              <h2>Profile</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-secondary"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone_number">Phone Number</label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-group">
                  <label>Name</label>
                  <p>{`${user.first_name} ${user.last_name}`}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-group">
                  <label>Phone</label>
                  <p>{user.phone_number || 'Not provided'}</p>
                </div>
              </div>
            )}
          </div>

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
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
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
            <h2 className="text-xl font-semibold mb-4">Top Matching Jobs</h2>
            {!filteredAndSortedJobs || filteredAndSortedJobs.length === 0 ? (
              <div className="result-card">
                <p className="text-gray-600">No matches found yet. Please upload your resume.</p>
              </div>
            ) : (
              filteredAndSortedJobs.map((item) => {
                const jobDetail = jobDetails[item.job_description];
                if (!jobDetail) return null;
                
                return (
                  <div key={item.id} className="result-card">
                    <div className="result-header">
                      <div>
                        <h3 className="result-title">{jobDetail.title}</h3>
                        <div className="result-meta">
                          <span>{jobDetail.company_name}</span>
                          <span>•</span>
                          <span>{jobDetail.location}</span>
                          <span>•</span>
                          <span>Type: {jobDetail.job_type.replace('_', ' ').toUpperCase()}</span>
                          <span>•</span>
                          <span>Experience: {jobDetail.experience_level.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="result-score">
                        {(item.score * 100).toFixed(1)}% Match
                      </div>
                    </div>
                    <div className="result-details">
                      <p className="text-sm text-gray-500 mb-2">
                        Posted: {new Date(jobDetail.created_at).toLocaleDateString()}
                      </p>
                      {jobDetail.file_url && (
                        <button
                          onClick={() => {
                            const fileUrl = jobDetail.file_url.startsWith('http')
                              ? jobDetail.file_url
                              : `${process.env.REACT_APP_API_URL || ''}${jobDetail.file_url}`;
                            window.open(fileUrl, '_blank');
                          }}
                          className="btn btn-secondary"
                        >
                          View Job Description
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;