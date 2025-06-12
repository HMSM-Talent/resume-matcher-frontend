import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyActiveJobs, reviewApplication, closeJob } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import '../styles/CompanyDashboard.css';

function CompanyDashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModal, setReviewModal] = useState({
    show: false,
    application: null,
    status: '',
    feedback: ''
  });
  const [closeModal, setCloseModal] = useState({
    show: false,
    jobId: null,
    reason: ''
  });
  const [processingId, setProcessingId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCompanyActiveJobs();
      setJobs(response.data.jobs);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view the company dashboard.');
      } else {
        setError('Failed to load company dashboard. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleReview = async () => {
    if (!reviewModal.application || !reviewModal.status) return;

    setProcessingId(reviewModal.application.id);
    try {
      await reviewApplication(reviewModal.application.id, {
        status: reviewModal.status,
        feedback: reviewModal.feedback
      });
      
      // Update local state
      setJobs(prev => prev.map(job => ({
        ...job,
        applications: job.applications.map(app => 
          app.id === reviewModal.application.id
            ? { ...app, status: reviewModal.status }
            : app
        )
      })));
      
      setReviewModal({ show: false, application: null, status: '', feedback: '' });
    } catch (err) {
      setError('Failed to update application status. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCloseJob = async () => {
    if (!closeModal.jobId) return;

    setProcessingId(closeModal.jobId);
    try {
      await closeJob(closeModal.jobId, { reason: closeModal.reason });
      
      // Update local state
      setJobs(prev => prev.filter(job => job.id !== closeModal.jobId));
      
      setCloseModal({ show: false, jobId: null, reason: '' });
    } catch (err) {
      setError('Failed to close job listing. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'DECLINED': return 'status-declined';
      case 'WITHDRAWN': return 'status-withdrawn';
      default: return '';
    }
  };

  if (loading && jobs.length === 0) {
    return <div className="loading">Loading company dashboard...</div>;
  }

  return (
    <div className="company-dashboard-container">
      <h1>Company Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="jobs-list">
        {jobs.length === 0 ? (
          <div className="no-jobs">No active job listings found</div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h2>{job.title}</h2>
                <div className="job-stats">
                  <div className="stat">
                    <span className="stat-label">Total Applications:</span>
                    <span className="stat-value">{job.applications_count.total}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Pending:</span>
                    <span className="stat-value">{job.applications_count.pending}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Approved:</span>
                    <span className="stat-value">{job.applications_count.approved}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Declined:</span>
                    <span className="stat-value">{job.applications_count.declined}</span>
                  </div>
                </div>
              </div>

              <div className="applications-section">
                <h3>Applications</h3>
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Match Score</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.applications.map(application => (
                      <tr key={application.id}>
                        <td>
                          <a 
                            href={application.candidate.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="resume-link"
                          >
                            {application.candidate.name}
                          </a>
                        </td>
                        <td>{application.score}%</td>
                        <td>{new Date(application.applied_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                            {application.status}
                          </span>
                        </td>
                        <td>
                          {application.status === 'PENDING' && (
                            <button
                              onClick={() => setReviewModal({
                                show: true,
                                application,
                                status: '',
                                feedback: ''
                              })}
                              className="btn btn-primary"
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="job-actions">
                <button
                  onClick={() => setCloseModal({ show: true, jobId: job.id, reason: '' })}
                  disabled={processingId === job.id}
                  className="btn btn-danger"
                >
                  {processingId === job.id ? 'Closing...' : 'Close Job'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Application Modal */}
      <Modal
        isOpen={reviewModal.show}
        onClose={() => setReviewModal({ show: false, application: null, status: '', feedback: '' })}
        title="Review Application"
        actions={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setReviewModal({ show: false, application: null, status: '', feedback: '' })}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleReview}
              disabled={!reviewModal.status || processingId === reviewModal.application?.id}
            >
              {processingId === reviewModal.application?.id ? 'Processing...' : 'Submit Review'}
            </button>
          </>
        }
      >
        <div className="review-form">
          <div className="form-group">
            <label>Status:</label>
            <select
              value={reviewModal.status}
              onChange={(e) => setReviewModal(prev => ({ ...prev, status: e.target.value }))}
              className="form-select"
            >
              <option value="">Select Status</option>
              <option value="APPROVED">Approve</option>
              <option value="DECLINED">Decline</option>
            </select>
          </div>
          <div className="form-group">
            <label>Feedback (optional):</label>
            <textarea
              value={reviewModal.feedback}
              onChange={(e) => setReviewModal(prev => ({ ...prev, feedback: e.target.value }))}
              className="form-textarea"
              placeholder="Add feedback for the candidate..."
              rows="4"
            />
          </div>
        </div>
      </Modal>

      {/* Close Job Modal */}
      <Modal
        isOpen={closeModal.show}
        onClose={() => setCloseModal({ show: false, jobId: null, reason: '' })}
        title="Close Job Listing"
        actions={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setCloseModal({ show: false, jobId: null, reason: '' })}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleCloseJob}
              disabled={processingId === closeModal.jobId}
            >
              {processingId === closeModal.jobId ? 'Closing...' : 'Confirm Close'}
            </button>
          </>
        }
      >
        <div className="close-form">
          <div className="form-group">
            <label>Reason for Closing (optional):</label>
            <textarea
              value={closeModal.reason}
              onChange={(e) => setCloseModal(prev => ({ ...prev, reason: e.target.value }))}
              className="form-textarea"
              placeholder="Add reason for closing this job listing..."
              rows="4"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CompanyDashboardPage;