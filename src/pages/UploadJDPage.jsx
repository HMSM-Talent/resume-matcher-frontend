import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, uploadJobDescription } from '../api/api';
import '../styles/Dashboard.css';

function UploadJDPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'entry',
    required_skills: '',
    is_active: true
  });
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await getCurrentUser();
        setUser(userRes.data);
        setFormData(prev => ({
          ...prev,
          company_name: userRes.data.company_name || ''
        }));
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        setSelectedFile(null);
        return;
      }
      // Check file type
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (!validTypes.includes(fileExtension)) {
        setUploadError('Please upload a PDF or Word document');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError('');
      setUploadSuccess('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!selectedFile) {
      errors.push('Please select a file to upload');
    }
    
    if (!formData.title?.trim()) {
      errors.push('Job title is required');
    }
    
    if (!formData.company_name?.trim()) {
      errors.push('Company name is required');
    }
    
    if (!formData.location?.trim()) {
      errors.push('Location is required');
    }
    
    if (!formData.job_type) {
      errors.push('Job type is required');
    }
    
    if (!formData.experience_level) {
      errors.push('Experience level is required');
    }
    
    if (errors.length > 0) {
      setUploadError(errors.join('. '));
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedFile);
    uploadFormData.append('title', formData.title.trim());
    uploadFormData.append('company_name', formData.company_name.trim());
    uploadFormData.append('location', formData.location.trim());
    uploadFormData.append('job_type', formData.job_type);
    uploadFormData.append('experience_level', formData.experience_level);
    uploadFormData.append('required_skills', formData.required_skills?.trim() || '');
    uploadFormData.append('is_active', formData.is_active ? 'true' : 'false');

    try {
      const response = await uploadJobDescription(uploadFormData);
      setUploadSuccess('Job description uploaded successfully.');
      setUploadError('');
      // Reset form after successful upload
      setFormData({
        title: '',
        company_name: user.company_name || '',
        location: '',
        job_type: 'full-time',
        experience_level: 'entry',
        required_skills: '',
        is_active: true
      });
      setSelectedFile(null);
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setUploadError('Network error: Please check your connection and try again.');
      } else {
        setUploadError(err.response?.data?.detail || err.response?.data?.error || 'Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="error-message">No user data available</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>{user.company_name || 'Company Dashboard'}</h2>
            <p>Welcome back!</p>
          </div>
          
          <div className="sidebar-menu">
            <button onClick={() => navigate('/company/dashboard')}>
              <span>📊 Overview</span>
            </button>
            <button className="active">
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

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Upload Job Description</h1>
          </div>

          <div className="filters-section">
            <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-4">
              <div className="filter-group">
                <label htmlFor="title">Job Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div className="filter-group">
                <label htmlFor="company_name">Company Name *</label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Your company name"
                  required
                />
              </div>

              <div className="filter-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, NY or Remote"
                  required
                />
              </div>

              <div className="filter-group">
                <label htmlFor="job_type">Job Type</label>
                <select
                  id="job_type"
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleInputChange}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="experience_level">Experience Level</label>
                <select
                  id="experience_level"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead Level</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="required_skills">Required Skills</label>
                <textarea
                  id="required_skills"
                  name="required_skills"
                  value={formData.required_skills}
                  onChange={handleInputChange}
                  placeholder="List key skills required for this position"
                  rows="3"
                />
              </div>

              <div className="filter-group">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Active Job Posting
                </label>
              </div>

              <div className="filter-group">
                <label htmlFor="file">Job Description File *</label>
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX (max 5MB)
                </p>
              </div>

              {uploadError && <div className="error-message">{uploadError}</div>}
              {uploadSuccess && <div className="success-message">{uploadSuccess}</div>}

              <div className="button-group">
                <button 
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="btn btn-primary"
                >
                  {isUploading ? 'Uploading...' : 'Upload Job Description'}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/company/dashboard')}
                  className="btn btn-secondary"
                  disabled={isUploading}
                >
                  Back to Dashboard
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UploadJDPage;