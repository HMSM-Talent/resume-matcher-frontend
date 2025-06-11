import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, searchJobDescriptions } from '../api/api';
import '../styles/SearchJobs.css';

function SearchJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    experienceLevel: '',
    minScore: 0,
    location: '',
  });
  const [sortBy, setSortBy] = useState('score');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          ...filters,
          min_score: filters.minScore,
          sort_by: sortBy,
        };
        
        const response = await searchJobDescriptions(params);
        setJobs(response.data.results || []);
      } catch (err) {
        setError('Failed to load jobs.');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, filters, sortBy]);

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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Filters Section */}
          <div className="filters-section">
            <h3 className="text-lg font-semibold mb-4">Search Jobs</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="search">Search</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title, company, skills, location..."
                  className="w-full"
                />
              </div>

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
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location..."
                  className="w-full"
                />
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
            <h2 className="text-xl font-semibold mb-4">Available Jobs</h2>
            {!jobs || jobs.length === 0 ? (
              <div className="result-card">
                <p className="text-gray-600">No jobs found matching your criteria.</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="result-card">
                  <div className="result-header">
                    <div>
                      <h3 className="result-title">{job.title}</h3>
                      <div className="result-meta">
                        <span>{job.company_name}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>Type: {job.job_type.replace('_', ' ').toUpperCase()}</span>
                        <span>•</span>
                        <span>Experience: {job.experience_level.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>
                    {job.score !== undefined && (
                      <div className="result-score">
                        {(job.score * 100).toFixed(1)}% Match
                      </div>
                    )}
                  </div>
                  <div className="result-details">
                    <p className="text-sm text-gray-500 mb-2">
                      Posted: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 items-center">
                      {job.file_url && (
                        <button
                          onClick={() => {
                            const fileUrl = job.file_url.startsWith('http')
                              ? job.file_url
                              : `${process.env.REACT_APP_API_URL || ''}${job.file_url}`;
                            window.open(fileUrl, '_blank');
                          }}
                          className="btn btn-secondary"
                        >
                          View Job Description
                        </button>
                      )}
                      {job.application_status ? (
                        <div className="application-status">
                          <span className={`status-badge status-${job.application_status.toLowerCase()}`}>
                            {job.application_status}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            Applied on {new Date(job.applied_at).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={!job.is_active}
                          className="btn btn-primary"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    {!job.is_active && !job.application_status && (
                      <p className="text-yellow-500 text-sm mt-2">This job posting is no longer active</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchJobsPage; 