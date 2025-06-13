import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getSimilarityScores, getJobDescription, applyForJob, getJobApplications } from '../api/api';
import '../styles/Dashboard.css';

function CandidateDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobDetails, setJobDetails] = useState({});
  const [applyingJobs, setApplyingJobs] = useState(new Set());
  const [applyError, setApplyError] = useState('');
  const [jobApplications, setJobApplications] = useState({});
  const [applicationStatus, setApplicationStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getCurrentUser();
        setUser(userRes.data);

        try {
          const scoreRes = await getSimilarityScores();
          const jobs = Array.isArray(scoreRes.data.results) ? scoreRes.data.results : [];
          
          // Fetch job applications first
          try {
            const applicationsRes = await getJobApplications();
            const applicationsMap = {};
            const statusMap = {};
            if (Array.isArray(applicationsRes.data)) {
              applicationsRes.data.forEach(app => {
                applicationsMap[app.job] = app;
                statusMap[app.job] = app.status;
              });
            }
            setJobApplications(applicationsMap);
            setApplicationStatus(statusMap);

            // Filter out jobs that have already been applied for
            const filteredJobs = jobs.filter(job => {
              const application = applicationsMap[job.job_description];
              // Show job if it hasn't been applied for or if it was withdrawn
              return !application || application.status === 'WITHDRAWN';
            });
            setJobs(filteredJobs);

            // Fetch job description details for each remaining job
            const jobDetailsPromises = filteredJobs.map(async (job) => {
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
          } catch (appErr) {
            console.error('Error fetching applications:', appErr);
            setJobApplications({});
            setApplicationStatus({});
            setJobs(jobs);
          }
        } catch (scoreErr) {
          console.error('Failed to fetch similarity scores:', scoreErr);
          setJobs([]);
          setError('Failed to load job recommendations. Please try again.');
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load data. Please try again.');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

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

      // Remove the job from the dashboard
      setJobs(prev => prev.filter(job => job.job_description !== jobId));
      setJobDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[jobId];
        return newDetails;
      });

    } catch (err) {
      console.error('Error applying for job:', err);
      let errorMessage = 'Failed to apply for the job. Please try again.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || 'You have already applied for this job.';
      } else if (err.response?.status === 404) {
        errorMessage = 'This job is no longer available.';
      }
      
      setApplyError(errorMessage);

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

  const getApplicationStatus = (jobId) => {
    return applicationStatus[jobId] || null;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'ACCEPTED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Job Recommendations</h1>
        <p className="text-gray-600">
          Based on your resume and preferences
        </p>
      </div>

      <div className="results-section">
        {!jobs || jobs.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h2>No Matching Jobs Found</h2>
            <p>We couldn't find any jobs that match your profile.</p>
            <button 
              onClick={() => navigate('/candidate/search')} 
              className="btn btn-primary"
            >
              Browse All Jobs
            </button>
          </div>
        ) : (
          <div className="results-list">
            {jobs.map((item) => {
              const jobDetail = jobDetails[item.job_description];
              if (!jobDetail) return null;
              
              const status = getApplicationStatus(jobDetail.id);
              const hasApplied = !!status;
              
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
                    <div className="flex gap-2 items-center">
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
                      {hasApplied ? (
                        <div className="application-status">
                          <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                            {status}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            Applied on {new Date(jobApplications[jobDetail.id].updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(jobDetail.id)}
                          disabled={applyingJobs.has(jobDetail.id) || !jobDetail.is_active}
                          className="btn btn-primary"
                        >
                          {applyingJobs.has(jobDetail.id) ? 'Applying...' : 'Apply'}
                        </button>
                      )}
                    </div>
                    {applyError && <p className="text-red-500 text-sm mt-2">{applyError}</p>}
                    {!jobDetail.is_active && !hasApplied && (
                      <p className="text-yellow-500 text-sm mt-2">This job posting is no longer active</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateDashboardPage;