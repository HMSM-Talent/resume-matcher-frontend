import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyJobListings } from '../api/api';
import api from '../api/api';
import '../styles/JobSearch.css';

interface JobDescription {
  id: number;
  title: string;
  company_name: string;
  location: string;
  job_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  experience_level: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER';
  required_skills: string;
  is_active: boolean;
  uploaded_at: string;
}

interface Filters {
  job_type: string;
  experience_level: string;
  location: string;
  is_active: boolean | null;
}

export default function CompanyJobListings() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    job_type: '',
    experience_level: '',
    location: '',
    is_active: null
  });
  const [sortBy, setSortBy] = useState<'uploaded_at' | 'title'>('uploaded_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchJobs();
  }, [filters, sortBy, sortOrder]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getCompanyJobListings({
        job_type: filters.job_type,
        experience_level: filters.experience_level,
        location: filters.location,
        is_active: filters.is_active,
        ordering: sortOrder === 'desc' ? `-${sortBy}` : sortBy
      });
      setJobs(response.data.results || []);
      setError('');
    } catch (err) {
      setError('Failed to load job listings. Please try again.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSortChange = (field: 'uploaded_at' | 'title') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleJobStatus = async (jobId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/job-descriptions/${jobId}/`, {
        is_active: !currentStatus
      });
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, is_active: !currentStatus } : job
      ));
    } catch (err) {
      setError('Failed to update job status. Please try again.');
      console.error('Error updating job status:', err);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading job listings...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const activeJobs = jobs.filter(job => job.is_active).length;
  const inactiveJobs = jobs.filter(job => !job.is_active).length;

  return (
    <div className="company-job-listings">
      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Job Listings</h3>
          <div className="value">{jobs.length}</div>
        </div>
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <div className="value">{activeJobs}</div>
        </div>
        <div className="stat-card">
          <h3>Inactive Jobs</h3>
          <div className="value">{inactiveJobs}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3 className="text-lg font-semibold mb-4">Filter Jobs</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="job_type">Job Type</label>
            <select
              id="job_type"
              name="job_type"
              value={filters.job_type}
              onChange={handleFilterChange}
            >
              <option value="">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="experience_level">Experience Level</label>
            <select
              id="experience_level"
              name="experience_level"
              value={filters.experience_level}
              onChange={handleFilterChange}
            >
              <option value="">All Experience Levels</option>
              <option value="ENTRY">Entry Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior Level</option>
              <option value="LEAD">Lead Level</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Filter by location"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="is_active">Status</label>
            <select
              id="is_active"
              name="is_active"
              value={filters.is_active === null ? '' : filters.is_active.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  is_active: value === '' ? null : value === 'true'
                }));
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <h2 className="text-xl font-semibold mb-4">Active Jobs Listed</h2>
      <div className="jobs-grid">
        {jobs.length === 0 ? (
          <div className="no-results">
            <p>No job listings found. Click "Upload Job Description" to post your first job.</p>
            <button
              onClick={() => navigate('/upload-jd')}
              className="btn btn-primary mt-4"
            >
              Upload Job Description
            </button>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3 className="job-title">{job.title}</h3>
                <div className="job-status">
                  <span className={`status-badge ${job.is_active ? 'active' : 'inactive'}`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="job-meta">
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.job_type.replace('_', ' ')}</span>
                <span>•</span>
                <span>{job.experience_level}</span>
              </div>

              <div className="job-footer">
                <span className="job-posted">
                  Posted {new Date(job.uploaded_at).toLocaleDateString()}
                </span>
                
                <div className="job-actions">
                  <button
                    onClick={() => toggleJobStatus(job.id, job.is_active)}
                    className={`btn ${job.is_active ? 'btn-warning' : 'btn-success'}`}
                  >
                    {job.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => navigate(`/company/jobs/${job.id}`)}
                    className="btn btn-secondary"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sort Controls */}
      <div className="sort-controls">
        <span>Sort by:</span>
        <button
          onClick={() => handleSortChange('uploaded_at')}
          className={`sort-button ${sortBy === 'uploaded_at' ? 'active' : ''}`}
        >
          Date {sortBy === 'uploaded_at' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSortChange('title')}
          className={`sort-button ${sortBy === 'title' ? 'active' : ''}`}
        >
          Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>
    </div>
  );
} 