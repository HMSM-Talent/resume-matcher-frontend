import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadJobDescription } from '../api/api';
import '../styles/Upload.css';

function UploadJDPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDetails, setJobDetails] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: 'FULL_TIME',
    experience_level: 'ENTRY',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a PDF file');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', jobDetails.title);
      formData.append('company_name', jobDetails.company_name);
      formData.append('location', jobDetails.location);
      formData.append('job_type', jobDetails.job_type);
      formData.append('experience_level', jobDetails.experience_level);
      formData.append('is_active', jobDetails.is_active);

      await uploadJobDescription(formData);
      setSuccess('Job Description uploaded successfully!');
      setFile(null);
      setJobDetails({
        title: '',
        company_name: '',
        location: '',
        job_type: 'FULL_TIME',
        experience_level: 'ENTRY',
        is_active: true
      });
      e.target.reset();
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/company/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload job description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <h1>Upload Job Description</h1>
        <p className="upload-description">
          Upload a job description in PDF format and provide additional details.
        </p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={jobDetails.title}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company_name">Company Name *</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={jobDetails.company_name}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={jobDetails.location}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="job_type">Job Type *</label>
            <select
              id="job_type"
              name="job_type"
              value={jobDetails.job_type}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experience_level">Experience Level *</label>
            <select
              id="experience_level"
              name="experience_level"
              value={jobDetails.experience_level}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="ENTRY">Entry Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior Level</option>
              <option value="LEAD">Lead Level</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={jobDetails.is_active}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              Active Job Posting
            </label>
          </div>

          <div className="file-upload-container">
            <input
              type="file"
              id="jd"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="jd" className="file-label">
              {file ? file.name : 'Choose PDF file'}
            </label>
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button
            type="submit"
            disabled={!file || loading}
            className="btn btn-primary"
          >
            {loading ? 'Uploading...' : 'Upload Job Description'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadJDPage;