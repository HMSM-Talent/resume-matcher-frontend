import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobDescriptionById } from '../api/api';
import '../styles/Dashboard.css';
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
  file: string; // URL to the job description file
  applications: Application[]; // Array of applications
}

interface Application {
  id: number;
  applied_at: string;
  resume: Resume;
  job_description: number; // This will be the job_id
}

interface Resume {
  id: number;
  file: string; // URL to the resume file
  uploaded_at: string;
  user: UserProfile; // Nested user details
}

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export default function CompanyJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setError('Job ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getJobDescriptionById(parseInt(jobId));
        setJob(response.data);
        console.log("DEBUG: Fetched Job Details (including applications):", response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return <div className="dashboard-container"><div className="dashboard-content"><div className="dashboard-main"><div className="loading-spinner">Loading job details...</div></div></div></div>;
  }

  if (error) {
    return <div className="dashboard-container"><div className="dashboard-content"><div className="dashboard-main"><div className="error-message">{error}</div></div></div></div>;
  }

  if (!job) {
    return <div className="dashboard-container"><div className="dashboard-content"><div className="dashboard-main"><div className="no-results">No job found.</div></div></div></div>;
  }

  const viewResume = (resumeFileUrl: string) => {
    const fullUrl = resumeFileUrl.startsWith('http') ? resumeFileUrl : `${import.meta.env.VITE_API_URL || ''}${resumeFileUrl}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>Company Dashboard</h2>
            <p>Job Details</p>
          </div>
          <div className="sidebar-menu">
            <button onClick={() => navigate('/company/dashboard')}>
              <span>📊 Overview</span>
            </button>
            <button onClick={() => navigate('/upload-jd')}>
              <span>📝 Upload Job Description</span>
            </button>
            <button onClick={() => navigate('/company/dashboard', { state: { editProfile: true } })}>
              <span>⚙️ Edit Profile</span>
            </button>
            <button onClick={() => {
              localStorage.clear();
              navigate('/');
            }}>
              <span>🚪 Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Job Details: {job.title}</h1>
          </div>

          <div className="job-detail-card">
            <div className="job-header">
              <h3 className="job-title">{job.title}</h3>
              <span className={`status-badge ${job.is_active ? 'active' : 'inactive'}`}>
                {job.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="job-meta">
              <span>{job.company_name}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.job_type.replace('_', ' ')}</span>
              <span>•</span>
              <span>{job.experience_level}</span>
            </div>
            <p className="job-posted">Posted: {new Date(job.uploaded_at).toLocaleDateString()}</p>
            <div className="job-description-content">
              {/* You might want to parse and display the full job description text here if available */}
              {job.file && (
                <button
                  onClick={() => {
                    const fileUrl = job.file.startsWith('http')
                      ? job.file
                      : `${import.meta.env.VITE_API_URL || ''}${job.file}`;
                    window.open(fileUrl, '_blank');
                  }}
                  className="btn btn-secondary mt-3"
                >
                  View Original Job Description File
                </button>
              )}
            </div>
          </div>

          <h2 className="text-xl font-semibold mt-6 mb-4">Applicants</h2>
          <div className="applications-list">
            {job.applications && job.applications.length > 0 ? (
              job.applications.map(application => (
                <div key={application.id} className="application-card">
                  <div className="application-header">
                    <h4 className="applicant-name">
                      {application.resume.user.first_name} {application.resume.user.last_name}
                    </h4>
                    <span className="application-date">
                      Applied: {new Date(application.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="applicant-contact">
                    <p>Email: {application.resume.user.email}</p>
                    {application.resume.user.phone_number && <p>Phone: {application.resume.user.phone_number}</p>}
                  </div>
                  <div className="application-actions">
                    <button
                      onClick={() => viewResume(application.resume.file)}
                      className="btn btn-primary"
                    >
                      View Resume
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No applications yet for this job.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 