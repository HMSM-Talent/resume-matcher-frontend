import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { searchJobDescriptions, applyForJob } from '../api/api';
import '../styles/SearchJobs.css';

function SearchJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingJobs, setApplyingJobs] = useState(new Set());
  const [applyError, setApplyError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    experienceLevel: '',
    minScore: 0,
    location: '',
  });
  const [sortBy, setSortBy] = useState('score');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
  });

  // Debounced search function
  const debouncedSearch = useCallback(async (searchParams) => {
    try {
      setLoading(true);
      setError('');

      const response = await searchJobDescriptions(searchParams);
      setJobs(response.data.results || []);
      setPagination(prev => ({
        ...prev,
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      }));
    } catch (err) {
      console.error('Search error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
      });
      
      let errorMessage = 'Failed to load jobs. ';
      if (err.response?.status === 401) {
        errorMessage += 'Please log in to view jobs.';
        navigate('/login');
      } else if (err.response?.data?.detail) {
        errorMessage += err.response.data.detail;
      } else if (err.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (err.response?.status === 403) {
        errorMessage += 'You do not have permission to view jobs.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Effect for initial load and pagination
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const searchParams = {
      search: filters.search || undefined,
      job_type: filters.jobType || undefined,
      experience_level: filters.experienceLevel || undefined,
      min_score: filters.minScore || undefined,
      location: filters.location || undefined,
      sort_by: sortBy || undefined,
      limit: 10,
      offset: (pagination.currentPage - 1) * 10,
    };

    // Remove undefined parameters
    Object.keys(searchParams).forEach(key => 
      searchParams[key] === undefined && delete searchParams[key]
    );

    debouncedSearch(searchParams);
  }, [user, pagination.currentPage, sortBy, debouncedSearch, navigate]);

  // Effect for filter changes with debounce
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      const searchParams = {
        search: filters.search || undefined,
        job_type: filters.jobType || undefined,
        experience_level: filters.experienceLevel || undefined,
        min_score: filters.minScore || undefined,
        location: filters.location || undefined,
        sort_by: sortBy || undefined,
        limit: 10,
        offset: 0, // Reset to first page on filter change
      };

      // Remove undefined parameters
      Object.keys(searchParams).forEach(key => 
        searchParams[key] === undefined && delete searchParams[key]
      );

      debouncedSearch(searchParams);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, sortBy, user, debouncedSearch]);

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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleApply = async (jobId) => {
    try {
      setApplyingJobs(prev => new Set([...prev, jobId]));
      setApplyError('');
      await applyForJob(jobId);
      
      // Update the job in the list to show application status
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, application_status: 'PENDING', applied_at: new Date().toISOString() }
            : job
        )
      );
    } catch (err) {
      console.error('Apply error:', err);
      let errorMessage = 'Failed to apply for the job. ';
      if (err.response?.status === 401) {
        errorMessage += 'Please log in to apply.';
        navigate('/login');
      } else if (err.response?.data?.detail) {
        errorMessage += err.response.data.detail;
      } else if (err.response?.status === 403) {
        errorMessage += 'You do not have permission to apply for this job.';
      }
      setApplyError(errorMessage);
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const totalPages = Math.ceil(pagination.count / 10);

  if (!user) {
    return null; // Will redirect in useEffect
  }

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Jobs</h2>
              <span className="text-sm text-gray-600">
                Showing {jobs.length} of {pagination.count} jobs
              </span>
            </div>
            
            {!jobs || jobs.length === 0 ? (
              <div className="result-card">
                <p className="text-gray-600">No jobs found matching your criteria.</p>
              </div>
            ) : (
              <>
                {jobs.map((job) => (
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
                      {job.similarity_score !== undefined && (
                        <div className="result-score">
                          {(job.similarity_score * 100).toFixed(1)}% Match
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
                            disabled={applyingJobs.has(job.id) || !job.is_active}
                            className="btn btn-primary"
                          >
                            {applyingJobs.has(job.id) ? 'Applying...' : 'Apply'}
                          </button>
                        )}
                      </div>
                      {applyError && <p className="text-red-500 text-sm mt-2">{applyError}</p>}
                      {!job.is_active && !job.application_status && (
                        <p className="text-yellow-500 text-sm mt-2">This job posting is no longer active</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination-controls mt-4 flex justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.previous}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span className="flex items-center">
                      Page {pagination.currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.next}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchJobsPage; 