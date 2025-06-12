import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyHistory } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/CompanyHistory.css';

function CompanyHistoryPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCompanyHistory(filters);
      setJobs(response.data.jobs);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view the company history.');
      } else {
        setError('Failed to load company history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, navigate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'CLOSED': return 'status-closed';
      case 'DRAFT': return 'status-draft';
      default: return '';
    }
  };

  const getApplicationStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'DECLINED': return 'status-declined';
      case 'WITHDRAWN': return 'status-withdrawn';
      case 'HIRED': return 'status-hired';
      default: return '';
    }
  };

  if (loading && jobs.length === 0) {
    return <div className="loading">Loading company history...</div>;
  }

  return (
    <div className="company-history-container">
      <h1>Company History</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search jobs..."
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="jobs-list">
        {jobs.length === 0 ? (
          <div className="no-jobs">No job listings found</div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div className="job-title-section">
                  <h2>{job.title}</h2>
                  <span className={`status-badge ${getStatusBadgeClass(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <div className="job-meta">
                  <span className="meta-item">
                    <i className="fas fa-building"></i> {job.company_name}
                  </span>
                  <span className="meta-item">
                    <i className="fas fa-map-marker-alt"></i> {job.location}
                  </span>
                  <span className="meta-item">
                    <i className="fas fa-clock"></i> Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="job-stats">
                <div className="stat">
                  <span className="stat-label">Total Applications</span>
                  <span className="stat-value">{job.applications_count.total}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Pending</span>
                  <span className="stat-value">{job.applications_count.pending}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Shortlisted</span>
                  <span className="stat-value">{job.applications_count.shortlisted}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Rejected</span>
                  <span className="stat-value">{job.applications_count.rejected}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Withdrawn</span>
                  <span className="stat-value">{job.applications_count.withdrawn}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Hired</span>
                  <span className="stat-value">{job.applications_count.hired}</span>
                </div>
              </div>

              <div className="applications-section">
                <h3>Application History</h3>
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('candidate_name')}>
                        Candidate
                        {filters.sortBy === 'candidate_name' && (
                          <i className={`fas fa-sort-${filters.sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('applied_at')}>
                        Applied Date
                        {filters.sortBy === 'applied_at' && (
                          <i className={`fas fa-sort-${filters.sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('status')}>
                        Status
                        {filters.sortBy === 'status' && (
                          <i className={`fas fa-sort-${filters.sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Feedback</th>
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
                        <td>{new Date(application.applied_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${getApplicationStatusBadgeClass(application.status)}`}>
                            {application.status}
                          </span>
                        </td>
                        <td>
                          {application.feedback && (
                            <div className="feedback-tooltip">
                              <i className="fas fa-comment"></i>
                              <div className="tooltip-content">
                                {application.feedback}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CompanyHistoryPage; 