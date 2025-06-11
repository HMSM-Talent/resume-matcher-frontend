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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getCurrentUser();
        setUser(userRes.data);

        try {
          const scoreRes = await getSimilarityScores();
          const jobs = Array.isArray(scoreRes.data.results) ? scoreRes.data.results : [];
          setJobs(jobs);

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

          // Fetch job applications
          const applicationsRes = await getJobApplications();
          const applicationsMap = {};
          if (Array.isArray(applicationsRes.data)) {
            applicationsRes.data.forEach(app => {
              applicationsMap[app.job] = app;
            });
          }
          setJobApplications(applicationsMap);
        } catch (scoreErr) {
          console.error('Failed to fetch similarity scores:', scoreErr);
          setJobs([]);
        }
      } catch (err) {
        setError('Failed to load data.');
        if (err.response?.status === 401) navigate('/login');
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
      await applyForJob(jobId);
      
      // Update the applications list after successful application
      const response = await getJobApplications();
      const applicationsMap = {};
      if (Array.isArray(response.data)) {
        response.data.forEach(app => {
          applicationsMap[app.job] = app;
        });
      }
      setJobApplications(applicationsMap);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to apply for the job. Please try again.';
      setApplyError(errorMessage);
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div className="error-message">No user data available</div>;

  const totalJobs = jobs.length;
  const averageScore = jobs.length > 0
    ? (jobs.reduce((acc, curr) => acc + curr.score, 0) / jobs.length * 100).toFixed(1)
    : 0;
  const topMatches = jobs.filter(j => j.score >= 0.8).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1>Candidate Dashboard</h1>
            <p>Welcome, {user.first_name} {user.last_name}</p>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Jobs</h3>
              <p className="stat-value">{totalJobs}</p>
            </div>
            <div className="stat-card">
              <h3>Average Match Score</h3>
              <p className="stat-value">{averageScore}%</p>
            </div>
            <div className="stat-card">
              <h3>Top Matches (80%+)</h3>
              <p className="stat-value">{topMatches}</p>
            </div>
          </div>

          <div className="results-list">
            <h2 className="text-xl font-semibold mb-4">Recommended Jobs</h2>
            {!jobs || jobs.length === 0 ? (
              <div className="result-card">
                <p className="text-gray-600">No matching jobs found. Please upload your resume.</p>
              </div>
            ) : (
              jobs.map((item) => {
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
                        {jobApplications[jobDetail.id] ? (
                          <div className="application-status">
                            <span className={`status-badge status-${jobApplications[jobDetail.id].status.toLowerCase()}`}>
                              {jobApplications[jobDetail.id].status}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              Applied on {new Date(jobApplications[jobDetail.id].applied_at).toLocaleDateString()}
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
                      {!jobDetail.is_active && !jobApplications[jobDetail.id] && (
                        <p className="text-yellow-500 text-sm mt-2">This job posting is no longer active</p>
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

export default CandidateDashboardPage;