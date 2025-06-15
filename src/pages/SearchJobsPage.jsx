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
  const [jobApplications, setJobApplications] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    experienceLevel: '',
    minScore: 0,
    location: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, location: locationInput }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchInput(value);
    } else if (name === 'location') {
      setLocationInput(value);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'ACCEPTED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      case 'WITHDRAWN':
        return 'status-withdrawn';
      default:
        return 'status-pending';
    }
  };

  const handleApply = async (jobId) => {
    try {
      setApplyingJobs(prev => new Set([...prev, jobId]));
      setApplyError('');
      
      // Immediately update the UI to show pending status
      setJobApplications(prev => ({
        ...prev,
        [jobId]: {
          id: 'pending',
          job: jobId,
          status: 'PENDING',
          updated_at: new Date().toISOString()
        }
      }));

      const response = await applyForJob(jobId);
      
      // Update the applications map with the response data
      setJobApplications(prev => ({
        ...prev,
        [jobId]: {
          id: response.data.id,
          job: jobId,
          status: response.data.status || 'PENDING',
          updated_at: response.data.updated_at || new Date().toISOString(),
          similarity_score: response.data.similarity_score
        }
      }));

    } catch (err) {
      // Handle error responses
      if (err.response?.data) {
        const { error, detail } = err.response.data;
        
        // Handle specific error cases
        if (error === 'Please upload a resume before applying for jobs.') {
          setApplyError('Please upload a resume before applying for jobs.');
          navigate('/profile');
        } else if (error === 'You have already applied for this job.') {
          setApplyError('You have already applied for this job.');
        } else if (error === 'Job not found or no longer active.') {
          setApplyError('This job is no longer available.');
        } else {
          setApplyError(detail || error || 'Failed to apply for the job');
        }
      } else {
        setApplyError('Failed to apply for the job. Please try again.');
      }

      // Remove the pending status on error
      setJobApplications(prev => {
        const newApps = { ...prev };
        delete newApps[jobId];
        return newApps;
      });
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
        ordering: sortBy === 'score' ? '-similarity_score' : '-created_at',
        minScore: filters.minScore,
        job_type: filters.jobType || undefined,
        experience_level: filters.experienceLevel || undefined
      };

      // Remove empty or undefined values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || searchParams[key] === undefined) {
          delete searchParams[key];
        }
      });

      console.log('Search params:', searchParams); // Debug log
      const response = await searchJobDescriptions(searchParams);
      const jobsData = response.data.results || [];

      // Fetch similarity scores
      try {
        const scoreRes = await getSimilarityScores();
        const scores = scoreRes.data.results || [];
        
        // Create a map of job IDs to scores
        const scoreMap = {};
        scores.forEach(score => {
          scoreMap[score.job_description] = score.score;
        });

        // Combine job data with scores and filter by minScore
        const jobsWithScores = jobsData
          .map(job => ({
            ...job,
            score: scoreMap[job.id] !== undefined ? scoreMap[job.id] : null,
            similarity_score: scoreMap[job.id] !== undefined ? scoreMap[job.id] : null
          }))
          .filter(job => {
            // If minScore is set, only show jobs with scores >= minScore
            if (filters.minScore > 0) {
              return job.score !== null && job.score >= filters.minScore;
            }
            return true;
          });

        // Sort jobs by score if that's the selected sort option
        if (sortBy === 'score') {
          jobsWithScores.sort((a, b) => {
            if (a.similarity_score === null) return 1;
            if (b.similarity_score === null) return -1;
            return b.similarity_score - a.similarity_score;
          });
        }

        setJobs(jobsWithScores);
      } catch (scoreErr) {
        console.error('Error fetching scores:', scoreErr);
        setJobs(jobsData);
      }

      // Fetch user's applications
      try {
        console.log('Starting to fetch applications...');
        const applicationsRes = await getJobApplications();
        console.log('Applications response received:', applicationsRes);
        
        if (applicationsRes?.data && Array.isArray(applicationsRes.data)) {
          console.log('Processing applications data...');
          const applicationsMap = {};
          applicationsRes.data.forEach(app => {
            if (app.job) {  // Only add if job ID exists
              applicationsMap[app.job] = {
                id: app.id,
                job: app.job,
                job_title: app.job_title,
                company_name: app.company_name,
                job_file_url: app.job_file_url,
                status: app.status,
                applied_at: app.applied_at,
                updated_at: app.updated_at,
                similarity_score: app.similarity_score,
                company_feedback: app.company_feedback
              };
            }
          });
          console.log('Processed applications map:', applicationsMap);
          setJobApplications(applicationsMap);
        } else {
          console.warn('Unexpected applications response format:', applicationsRes);
          setError('Received unexpected data format for applications');
        }
      } catch (appErr) {
        console.error('Error fetching applications:', {
          error: appErr,
          message: appErr.message,
          response: appErr.response?.data,
          stack: appErr.stack
        });
        
        if (appErr.message === 'Please log in to view your applications') {
          console.log('Redirecting to login...');
          navigate('/login');
        } else if (appErr.message === 'You do not have permission to view applications') {
          setError('You do not have permission to view applications. Please contact support if this is an error.');
        } else if (appErr.message.includes('resume')) {
          console.log('Redirecting to profile for resume upload...');
          setError('Please upload a resume before viewing your applications.');
          navigate('/profile');
        } else {
          setError(`Failed to load application history: ${appErr.message}`);
        }
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
                <form onSubmit={handleSearchSubmit} className="search-form">
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={searchInput}
                    onChange={handleInputChange}
                    placeholder="Search jobs..."
                    className="w-full"
                  />
                  <button type="submit" className="search-button">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
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
                <form onSubmit={handleLocationSubmit} className="search-form">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={locationInput}
                    onChange={handleInputChange}
                    placeholder="Enter location..."
                    className="w-full"
                  />
                  <button type="submit" className="search-button">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
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
                        {jobApplications[job.id] ? (
                          <div className="application-status">
                            <span className={`status-badge ${getStatusBadgeClass(jobApplications[job.id].status)}`}>
                              {jobApplications[job.id].status}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              Applied on {new Date(jobApplications[job.id].updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(job.id)}
                            disabled={applyingJobs.has(job.id) || !job.is_active}
                            className={`btn btn-primary ${applyingJobs.has(job.id) ? 'opacity-50' : ''}`}
                          >
                            {applyingJobs.has(job.id) ? (
                              <div className="flex items-center gap-2">
                                <div className="spinner w-4 h-4"></div>
                                <span>Applying...</span>
                              </div>
                            ) : (
                              'Apply'
                            )}
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