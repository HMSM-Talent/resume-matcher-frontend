import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getJobDescriptions } from '../api/api';
import '../styles/Dashboard.css';

function CompanyDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userRes = await getCurrentUser();
        setUser(userRes.data);

        // Fetch job descriptions
        const jobsRes = await getJobDescriptions();
        
        // Handle both paginated and non-paginated responses
        const jobsData = Array.isArray(jobsRes.data) 
          ? jobsRes.data 
          : (jobsRes.data?.results || []);
        
        setJobs(jobsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load data. Please try again later.');
        }
        setJobs([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Memoize filtered jobs to prevent unnecessary recalculations
  const activeJobs = useMemo(() => 
    jobs.filter(job => job.is_active), 
    [jobs]
  );

  const totalJobs = jobs.length;

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div className="error-message">No user data available</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1>Company Dashboard</h1>
            <p>Welcome, {user.company_name}</p>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Job Postings</h3>
              <p className="stat-value">{totalJobs}</p>
            </div>
            <div className="stat-card">
              <h3>Active Jobs</h3>
              <p className="stat-value">{activeJobs.length}</p>
            </div>
          </div>

          <div className="jobs-section">
            <h2>Your Job Postings</h2>
            {totalJobs === 0 ? (
              <p className="no-data">No job postings found.</p>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className={`status-badge ${job.is_active ? 'active' : 'inactive'}`}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="job-details">
                      <p><strong>Location:</strong> {job.location}</p>
                      <p><strong>Type:</strong> {job.job_type.replace('_', ' ').toUpperCase()}</p>
                      <p><strong>Experience:</strong> {job.experience_level.replace('_', ' ').toUpperCase()}</p>
                      <p><strong>Posted:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboardPage;