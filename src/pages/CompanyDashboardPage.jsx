import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyDashboard, closeJob, getAllJobApplications, updateApplicationStatus } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/CompanyDashboardPage.css';

const CompanyDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching jobs for dashboard...');
      const response = await getCompanyDashboard();
      console.log('Dashboard response:', response);

      // Check if response has data
      if (!response.data) {
        console.error('No data in response');
        setError('No data received from server');
        return;
      }

      // Handle different possible response structures
      let jobsData = [];
      if (Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (response.data.jobs && Array.isArray(response.data.jobs)) {
        jobsData = response.data.jobs;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        jobsData = response.data.data;
      } else if (response.data.data?.jobs && Array.isArray(response.data.data.jobs)) {
        jobsData = response.data.data.jobs;
      }

      console.log('Processed jobs data:', jobsData);

      // Filter out closed jobs
      const activeJobs = jobsData.filter(job => job.is_active !== false);
      console.log('Active jobs:', activeJobs);
      
      setJobs(activeJobs);
    } catch (err) {
      console.error('Dashboard error:', err);
      let errorMessage = 'Failed to load dashboard data. Please try again later.';
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Please log in again to view your dashboard.';
            break;
          case 403:
            errorMessage = 'You do not have permission to view this dashboard.';
            break;
          case 404:
            errorMessage = 'Dashboard data not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = err.response.data?.error || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCloseJob = (jobId) => {
    setSelectedJobId(jobId);
    setShowCloseModal(true);
    setCloseError(null);
    setCloseReason('');
  };

  const confirmCloseJob = async () => {
    if (!selectedJobId) return;

    try {
      setIsClosing(true);
      setCloseError(null);
      const response = await closeJob(selectedJobId, closeReason);
      console.log('Close job response:', response);
      
      // Update the jobs list
      setJobs(prev => prev.filter(job => job.id !== selectedJobId));
      setShowCloseModal(false);
    } catch (err) {
      console.error('Error closing job:', err);
      let errorMessage = 'Failed to close job. Please try again.';
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = 'This job is already closed.';
            break;
          case 403:
            errorMessage = 'You are not authorized to close this job.';
            break;
          case 404:
            errorMessage = 'Job not found. Please refresh the page and try again.';
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      }
      
      setCloseError(errorMessage);
    } finally {
      setIsClosing(false);
    }
  };

  // Helper function to display shortened job ID
  const displayJobId = (jobId) => {
    if (!jobId) return 'N/A';
    return jobId.substring(0, 8) + '...';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-badge-pending';
      case 'ACCEPTED':
        return 'status-badge-approved';
      case 'REJECTED':
        return 'status-badge-declined';
      default:
        return '';
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    if (status === 'REJECTED') {
      setSelectedApplication(applicationId);
      setShowFeedbackModal(true);
    } else {
      await updateApplicationStatus(applicationId, status);
    }
  };

  const handleSubmitFeedback = async () => {
    if (selectedApplication) {
      try {
        setIsUpdatingStatus(true);
        await updateApplicationStatus(selectedApplication, 'REJECTED', feedback);
        // Refresh the jobs list to show updated status
        await fetchJobs();
        setShowFeedbackModal(false);
        setFeedback('');
        setSelectedApplication(null);
      } catch (error) {
        console.error('Error submitting feedback:', error);
        setError('Failed to update application status. Please try again.');
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      setIsUpdatingStatus(true);
      await updateApplicationStatus(applicationId, 'ACCEPTED');
      // Refresh the jobs list to show updated status
      await fetchJobs();
    } catch (error) {
      console.error('Error accepting application:', error);
      setError('Failed to accept application. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
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
          <button onClick={fetchJobs} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Company Dashboard</h1>
        <button 
          onClick={() => navigate('/company/upload')} 
          className="btn btn-primary"
        >
          <i className="fas fa-plus"></i> Post New Job
        </button>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="no-jobs-message">
          <i className="fas fa-briefcase"></i>
          <h2>No Active Jobs</h2>
          <p>Start by posting your first job opening</p>
          <button 
            onClick={() => navigate('/company/upload')} 
            className="btn btn-primary"
          >
            Post a Job
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h2>{job.title}</h2>
                <div className="job-id">ID: {displayJobId(job.id)}</div>
                <button
                  onClick={() => handleCloseJob(job.id)}
                  className="btn btn-danger btn-sm"
                >
                  <i className="fas fa-times"></i> Close Job
                </button>
              </div>

              <div className="job-stats-grid">
                <div className="stat-card total">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{job.application_counts?.total || 0}</span>
                    <span className="stat-label">Total Applications</span>
                  </div>
                </div>

                <div className="stat-card high-match">
                  <div className="stat-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{job.application_counts?.high_match || 0}</span>
                    <span className="stat-label">High Match</span>
                  </div>
                </div>

                <div className="stat-card medium-match">
                  <div className="stat-icon">
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{job.application_counts?.medium_match || 0}</span>
                    <span className="stat-label">Medium Match</span>
                  </div>
                </div>

                <div className="stat-card low-match">
                  <div className="stat-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{job.application_counts?.low_match || 0}</span>
                    <span className="stat-label">Low Match</span>
                  </div>
                </div>
              </div>

              <div className="recent-applications">
                <h3>Recent Applications</h3>
                {job.recent_applications && job.recent_applications.length > 0 ? (
                  <div className="applications-list">
                    {job.recent_applications.map(application => (
                      <div key={application.id} className="application-card">
                        <div className="application-header">
                          <div className="candidate-info">
                            <h4>{`${application.user.first_name} ${application.user.last_name}`}</h4>
                            <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                          <div className="application-meta">
                            <span className="score">
                              Score: {application.similarity_score}%
                            </span>
                            <span className="date">
                              Applied: {new Date(application.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="application-actions">
                          <button
                            onClick={() => {
                              if (!application.resume_file_url) {
                                console.error('Resume URL is missing for this application:', application);
                                return;
                              }
                              const cleanFileUrl = application.resume_file_url
                                .replace(/^\/+/, '')
                                .replace(/^http:\/\/localhost:8000\//, '');
                              const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '';
                              const fullUrl = `${baseUrl}/${cleanFileUrl}`;
                              console.log('Opening resume URL:', fullUrl);
                              window.open(fullUrl, '_blank');
                            }}
                            className="btn btn-secondary"
                            disabled={!application.resume_file_url}
                          >
                            View Resume
                          </button>
                          {application.status === 'PENDING' && (
                            <div className="status-actions">
                              <button
                                onClick={() => handleAcceptApplication(application.id)}
                                className="btn btn-success"
                                disabled={isUpdatingStatus}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleApplicationStatus(application.id, 'REJECTED')}
                                className="btn btn-danger"
                                disabled={isUpdatingStatus}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-applications">No applications yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCloseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Close Job Posting</h2>
            <p>Are you sure you want to close this job posting? This action cannot be undone.</p>
            
            {closeError && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <p>{closeError}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="closeReason">Reason for closing (optional):</label>
              <textarea
                id="closeReason"
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="Enter reason for closing the job..."
                rows="3"
                disabled={isClosing}
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setCloseReason('');
                  setClosingJobId(null);
                  setCloseError(null);
                }}
                className="btn btn-secondary"
                disabled={isClosing}
              >
                Cancel
              </button>
              <button 
                onClick={confirmCloseJob} 
                className="btn btn-danger"
                disabled={isClosing}
              >
                {isClosing ? (
                  <>
                    <span className="spinner-small"></span>
                    Closing...
                  </>
                ) : (
                  'Confirm Close'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Provide Feedback</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback for the candidate..."
              className="feedback-textarea"
              rows="4"
            />
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedback('');
                  setSelectedApplication(null);
                }}
                className="btn btn-secondary"
                disabled={isUpdatingStatus}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="btn btn-danger"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboardPage;