import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplicationHistory, withdrawApplication } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import '../styles/CandidateHistory.css';

function CandidateHistoryPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    applicationId: null
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'applied_at',
    direction: 'desc'
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getApplicationHistory();
      
      if (response.status === 'success') {
        setApplications(response.data);
      } else {
        setError(response.message || 'Failed to fetch applications');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view application history.');
      } else {
        setError('Failed to fetch applications');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedApplications = [...applications].sort((a, b) => {
    if (sortConfig.key === 'applied_at') {
      const dateA = new Date(a.applied_at);
      const dateB = new Date(b.applied_at);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortConfig.key === 'similarity_score') {
      const scoreA = a.similarity_score || 0;
      const scoreB = b.similarity_score || 0;
      return sortConfig.direction === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleWithdraw = async (applicationId) => {
    setWithdrawingId(applicationId);
    try {
      const response = await withdrawApplication(applicationId);
      if (response.data.status === 'success') {
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                status: 'WITHDRAWN',
                updated_at: response.data.data.withdrawn_at || new Date().toISOString()
              }
            : app
        ));
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to withdraw this application.');
      } else if (err.response?.status === 404) {
        setError('Application not found.');
      } else if (err.response?.status === 400) {
        setError('This application cannot be withdrawn.');
      } else {
        setError('Failed to withdraw application. Please try again.');
      }
    } finally {
      setWithdrawingId(null);
      setConfirmModal({ show: false, applicationId: null });
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

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading && applications.length === 0) {
    return <div className="loading">Loading application history...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Application History</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="applications-list">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('applied_at')}
              >
                Applied Date {getSortIcon('applied_at')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('similarity_score')}
              >
                Match Score {getSortIcon('similarity_score')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedApplications.map((application) => (
              <tr key={application.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(application.applied_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {application.similarity_score ? `${application.similarity_score}%` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {application.job_title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {application.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge status-${application.status.toLowerCase()}`}>
                    {application.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const fileUrl = application?.job_description_file;
                        if (!fileUrl) {
                          console.error('File URL is missing for this job application:', application);
                          return;
                        }

                        // Remove any leading slashes from the file URL
                        const cleanFileUrl = fileUrl.replace(/^\/+/, '');
                        
                        // Construct the full URL using the base URL without /api/
                        const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '';
                        const fullUrl = `${baseUrl}/${cleanFileUrl}`;

                        window.open(fullUrl, '_blank');
                      }}
                      className="btn btn-secondary"
                      disabled={!application?.job_description_file}
                    >
                      View Job Description
                    </button>
                    {application.status === 'PENDING' && (
                      <button
                        onClick={() => handleWithdraw(application.id)}
                        disabled={withdrawingId === application.id}
                        className="btn btn-danger"
                      >
                        {withdrawingId === application.id ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CandidateHistoryPage; 