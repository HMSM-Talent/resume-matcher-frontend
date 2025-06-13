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
      console.log('Fetching company history with filters:', filters);
      const response = await getCompanyHistory(filters);
      console.log('Company history response:', response);
      
      if (response.data && response.data.data) {
        console.log('Setting jobs with data:', response.data.data);
        const jobsData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setJobs(jobsData);
      } else {
        console.warn('Unexpected response structure:', response.data);
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching company history:', err);
      if (err.response?.status === 401) {
        console.log('Unauthorized access, redirecting to login');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view the company history.');
      } else if (err.response?.status === 500) {
        setError('Server error occurred. Please try again later or contact support.');
        console.error('Server error details:', err.response?.data);
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
      default: return '';
    }
  };

  const getApplicationStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'ACCEPTED': return 'status-approved';
      case 'REJECTED': return 'status-declined';
      default: return '';
    }
  };

  if (loading) {
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
        {!jobs || jobs.length === 0 ? (
          <div className="no-jobs">No job listings found</div>
        ) : (
          jobs.map(job => {
            console.log('Rendering job:', job);
            return (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div className="job-title-section">
                    <h2>{job.title || 'Untitled Job'}</h2>
                    <span className={`status-badge ${getStatusBadgeClass(job.is_active ? 'ACTIVE' : 'CLOSED')}`}>
                      {job.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>
                <div className="job-meta">
                  <span className="meta-item">
                      <i className="fas fa-building"></i> {job.company_name || 'Company Name'}
                    </span>
                    <span className="meta-item">
                      <i className="fas fa-map-marker-alt"></i> {job.location || 'Location'}
                  </span>
                  <span className="meta-item">
                      <i className="fas fa-clock"></i> Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Date not available'}
                  </span>
                  <span className="meta-item">
                      <i className="fas fa-briefcase"></i> {job.job_type || 'Job Type'}
                  </span>
                </div>
              </div>

              <div className="job-stats">
                <div className="stat">
                  <span className="stat-label">Total Applications</span>
                    <span className="stat-value">{job.application_counts?.total || 0}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">High Match</span>
                    <span className="stat-value">{job.application_counts?.high_match || 0}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Medium Match</span>
                    <span className="stat-value">{job.application_counts?.medium_match || 0}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Low Match</span>
                    <span className="stat-value">{job.application_counts?.low_match || 0}</span>
                </div>
              </div>

                {job.applications && job.applications.length > 0 && (
              <div className="applications-section">
                    <h3>Applications</h3>
                    <div className="applications-table">
                      <table>
                  <thead>
                    <tr>
                            <th>Candidate</th>
                            <th>Applied Date</th>
                            <th>Status</th>
                            <th>Match Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.applications.map(application => (
                      <tr key={application.id}>
                        <td>
                          {`${application.user.first_name} ${application.user.last_name}`}
                        </td>
                        <td>{new Date(application.updated_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${getApplicationStatusBadgeClass(application.status)}`}>
                            {application.status}
                          </span>
                        </td>
                        <td>{Math.round(application.similarity_score * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CompanyHistoryPage; 