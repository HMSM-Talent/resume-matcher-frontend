import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { searchJobDescriptions, applyForJob, getSimilarityScores, getJobApplications } from '../api/api';
import '../styles/SearchJobs.css';

function SearchJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingJobs, setApplyingJobs] = useState(new Set());
  const [applyError, setApplyError] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleApply = async (jobId) => {
    try {
      setApplyingJobs(prev => new Set([...prev, jobId]));
      setApplyError('');
      const response = await applyForJob(jobId);
      
      // Handle success response
      if (response.data.status === 'success') {
        // Update the applied jobs set with the job ID from the response
        const jobIdFromResponse = response.data.data.job;
        setAppliedJobs(prev => new Set([...prev, jobIdFromResponse]));
        
        // Update the jobs list to reflect the application
        setJobs(prev => prev.map(job => 
          job.id === jobIdFromResponse 
            ? { ...job, has_applied: true }
            : job
        ));

        // Show success message for resubmission
        if (response.data.message === 'Application resubmitted successfully') {
          setApplyError(`Job ${jobId}: Application resubmitted successfully`);
          // Clear the success message after 3 seconds
          setTimeout(() => {
            setApplyError('');
          }, 3000);
        }
      }
    } catch (err) {
      // Handle error responses
      if (err.response?.data) {
        const { status, message, detail, data } = err.response.data;
        
        // If we have data in the error response
        if (data) {
          const jobIdFromResponse = data.job;
          const applicationStatus = data.status;

          // Update UI based on application status
          if (applicationStatus === 'WITHDRAWN') {
            // For withdrawn applications, we can try to reapply
            setAppliedJobs(prev => new Set([...prev, jobIdFromResponse]));
            setJobs(prev => prev.map(job => 
              job.id === jobIdFromResponse 
                ? { ...job, has_applied: true }
                : job
            ));
          } else if (['REJECTED', 'HIRED'].includes(applicationStatus)) {
            // For final states, show the error message
            setApplyError(`Job ${jobId}: ${detail || message || 'Cannot re-apply for this job'}`);
          }
        } else {
          // Show the error message for other cases
          setApplyError(`Job ${jobId}: ${detail || message || 'Failed to apply for the job'}`);
        }
      } else {
        // Handle network errors or unexpected errors
        setApplyError(`Job ${jobId}: Failed to apply for the job. Please try again.`);
      }
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch job listings with sorting parameters
      const searchParams = {
        ...filters,
        page: pagination.currentPage,
        ordering: sortBy === 'score' ? '-score_value' : '-created_at',
        min_score: filters.minScore
      };
      const response = await searchJobDescriptions(searchParams);
      const jobsData = response.data.results || [];

      // Fetch similarity scores
      try {
        const scoreRes = await getSimilarityScores();
        const scores = Array.isArray(scoreRes.data.results) ? scoreRes.data.results : [];
        
        // Create a map of job IDs to scores
        const scoreMap = {};
        scores.forEach(score => {
          scoreMap[score.job_description] = score.score;
        });

        // Combine job data with scores
        const jobsWithScores = jobsData.map(job => ({
          ...job,
          score: scoreMap[job.id] !== undefined ? scoreMap[job.id] : null
        }));

        setJobs(jobsWithScores);
      } catch (scoreErr) {
        console.error('Error fetching scores:', scoreErr);
        setJobs(jobsData);
      }

      // Fetch user's applications
      try {
        const applicationsRes = await getJobApplications();
        if (applicationsRes.data && Array.isArray(applicationsRes.data)) {
          const appliedJobIds = new Set(applicationsRes.data.map(app => app.job));
          setAppliedJobs(appliedJobIds);
        }
      } catch (appErr) {
        console.error('Error fetching applications:', appErr);
      }

      setPagination(prev => ({
        ...prev,
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      }));
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, sortBy, navigate]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user, fetchJobs]);

  if (!user) {
    return null;
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const totalPages = Math.ceil(pagination.count / 10);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="search-header">
            <h1>Search Jobs</h1>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="search">Search</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search jobs..."
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
                      <div className="result-score">
                        {job.score !== null ? (
                          `${(job.score * 100).toFixed(1)}% Match`
                        ) : (
                          <span className="text-gray-500 text-sm">
                            Score not available
                          </span>
                        )}
                      </div>
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
                        {appliedJobs.has(job.id) ? (
                          <div className="application-status">
                            <span className="status-badge status-pending">Applied</span>
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
                      {applyError && applyError.startsWith(`Job ${job.id}:`) && (
                        <p className={`text-sm mt-2 ${
                          applyError.includes('resubmitted successfully') 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {applyError.replace(`Job ${job.id}:`, '')}
                        </p>
                      )}
                      {!job.is_active && (
                        <p className="text-yellow-500 text-sm mt-2">This job posting is no longer active</p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.previous}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchJobsPage; 