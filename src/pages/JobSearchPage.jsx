import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser, searchJobs } from '../api/api';
import '../styles/Dashboard.css';
import '../styles/JobSearch.css';

function JobSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [applyingJobs, setApplyingJobs] = useState(new Set());
  const [applicationStatus, setApplicationStatus] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await getCurrentUser();
        setUser(userRes.data);
      } catch (err) {
        // Don't set error for unauthenticated users
        if (err.response?.status !== 401) {
          setError('Failed to load user data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await searchJobs(searchQuery, currentPage);
        setJobs(response.data.results || []);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
        setTotalJobs(response.data.count);
      } catch (err) {
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchJobs();
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentPage]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    setSearchParams({ q: query, page: '1' });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchParams({ q: searchQuery, page: page.toString() });
  };

  const handleApply = async (jobId) => {
    if (!user || user.role !== 'candidate') {
      navigate('/login', { state: { from: '/jobs' } });
      return;
    }

    if (applyingJobs.has(jobId)) return;
    
    setApplyingJobs(prev => new Set([...prev, jobId]));
    setApplicationStatus(prev => ({ ...prev, [jobId]: { status: 'applying', message: '' } }));
    
    try {
      await applyForJob(jobId);
      setApplicationStatus(prev => ({ 
        ...prev, 
        [jobId]: { status: 'success', message: 'Application submitted successfully!' } 
      }));
    } catch (err) {
      setApplicationStatus(prev => ({ 
        ...prev, 
        [jobId]: { 
          status: 'error', 
          message: err.response?.data?.detail || 'Failed to submit application. Please try again.' 
        } 
      }));
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  if (loading && !jobs.length) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-main">
            <div className="loading-spinner">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>Job Search</h2>
            <p>Find your next opportunity</p>
          </div>
          
          <div className="sidebar-menu">
            {user ? (
              <>
                <button onClick={() => navigate(user.role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard')}>
                  <span>📊 Dashboard</span>
                </button>
                
                <button className="active">
                  <span>🔍 Job Search</span>
                </button>

                {user.role === 'candidate' && (
                  <button onClick={() => navigate('/upload-resume')}>
                    <span>📝 Upload Resume</span>
                  </button>
                )}
                {user.role === 'company' && (
                  <button onClick={() => navigate('/upload-jd')}>
                    <span>📝 Post Job</span>
                  </button>
                )}
                <button onClick={() => {
                  localStorage.clear();
                  navigate('/');
                }}>
                  <span>🚪 Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')}>
                  <span>🔑 Login</span>
                </button>
                <button onClick={() => navigate('/register')}>
                  <span>📝 Register</span>
                </button>
                <button className="active">
                  <span>🔍 Job Search</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Find Jobs</h1>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search jobs by title, description, or company..."
                className="search-input"
              />
              <button className="search-button">
                🔍 Search
              </button>
            </div>
            {totalJobs > 0 && (
              <p className="search-results-count">
                Found {totalJobs} {totalJobs === 1 ? 'job' : 'jobs'}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Jobs Grid */}
          <div className="jobs-grid">
            {jobs.length === 0 ? (
              <div className="no-results">
                <p>No jobs found matching your search criteria.</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-company">{job.company_name}</div>
                  </div>
                  
                  <div className="job-meta">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.job_type}</span>
                    <span>•</span>
                    <span>{job.experience_level}</span>
                  </div>

                  <p className="job-description">
                    {job.description?.length > 150 
                      ? `${job.description.substring(0, 150)}...` 
                      : job.description}
                  </p>

                  <div className="job-footer">
                    <span className="job-posted">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    
                    <div className="job-actions">
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="btn btn-secondary"
                      >
                        View Details
                      </button>
                      
                      {user?.role === 'candidate' ? (
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={applyingJobs.has(job.id) || applicationStatus[job.id]?.status === 'success'}
                          className={`btn ${
                            applicationStatus[job.id]?.status === 'success' 
                              ? 'btn-success' 
                              : 'btn-primary'
                          }`}
                        >
                          {applyingJobs.has(job.id) 
                            ? 'Applying...' 
                            : applicationStatus[job.id]?.status === 'success'
                              ? 'Applied ✓'
                              : 'Apply Now'}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/login', { state: { from: '/jobs' } })}
                          className="btn btn-primary"
                        >
                          {user ? 'Login to Apply' : 'Sign in to Apply'}
                        </button>
                      )}
                    </div>
                  </div>

                  {applicationStatus[job.id]?.message && (
                    <p className={`application-status ${
                      applicationStatus[job.id].status === 'success' 
                        ? 'status-success' 
                        : applicationStatus[job.id].status === 'error'
                          ? 'status-error'
                          : 'status-info'
                    }`}>
                      {applicationStatus[job.id].message}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`pagination-button ${
                    currentPage === index + 1 ? 'active' : ''
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default JobSearchPage; 