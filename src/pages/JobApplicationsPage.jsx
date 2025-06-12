import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplications, getJobDescription } from '../api/api';
import '../styles/CompanyDashboard.css';

function JobApplicationsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL',
    search: '',
    sortBy: 'applied_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch job details
        const jobRes = await getJobDescription(jobId);
        setJobDetails(jobRes.data);

        // Fetch applications for this job
        const applicationsRes = await getJobApplications(jobId);
        setApplications(applicationsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Failed to load applications');
        if (err.response?.status === 404) {
          setError('Job not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

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

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return '↕';
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'ACCEPTED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-declined';
      default:
        return '';
    }
  };

  const filteredApplications = applications
    .filter(app => {
      if (filters.status !== 'ALL' && app.status !== filters.status) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const candidateName = `${app.candidate.first_name} ${app.candidate.last_name}`.toLowerCase();
        return candidateName.includes(searchTerm);
      }
      return true;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      if (filters.sortBy === 'applied_at') {
        return order * (new Date(a.applied_at) - new Date(b.applied_at));
      }
      if (filters.sortBy === 'similarity_score') {
        return order * (a.similarity_score - b.similarity_score);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading applications...</p>
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
          <button onClick={() => navigate('/company/dashboard')} className="btn btn-primary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Applications for {jobDetails?.title}</h1>
          <p className="text-gray-600">
            {jobDetails?.company_name} • {jobDetails?.location}
          </p>
        </div>
        <button onClick={() => navigate('/company/dashboard')} className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-input"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by candidate name..."
            className="form-input"
          />
        </div>
      </div>

      <div className="applications-section">
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('applied_at')}
                  className="sortable"
                >
                  Applied Date {getSortIcon('applied_at')}
                </th>
                <th 
                  onClick={() => handleSort('similarity_score')}
                  className="sortable"
                >
                  Match Score {getSortIcon('similarity_score')}
                </th>
                <th>Candidate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td>{new Date(application.applied_at).toLocaleDateString()}</td>
                  <td>{application.similarity_score}%</td>
                  <td>
                    {`${application.candidate.first_name} ${application.candidate.last_name}`}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/company/application/${application.id}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        View Details
                      </button>
                      {application.candidate.resume_url && (
                        <button
                          onClick={() => window.open(application.candidate.resume_url, '_blank')}
                          className="btn btn-primary btn-sm"
                        >
                          View Resume
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="no-applications">
            <p>No applications found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobApplicationsPage; 