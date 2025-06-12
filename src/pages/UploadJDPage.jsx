import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadJobDescription, getCurrentUser } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Upload.css';

function UploadJDPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: '',
    experience_level: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is logged in and is a company
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role.toLowerCase() !== 'company') {
      setError('You must be a company to upload job descriptions');
      navigate('/');
      return;
    }

    // Fetch current user data to verify permissions
    const fetchUserData = async () => {
      try {
        const response = await getCurrentUser();
        if (response.data.role.toLowerCase() !== 'company') {
          setError('You must be a company to upload job descriptions');
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          setError('Failed to verify permissions. Please try again.');
        }
      }
    };
    fetchUserData();
  }, [navigate, user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFormData(prev => ({
        ...prev,
        file: null
      }));
      return;
    }

    // Check file type
    const validTypes = ['application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select a PDF file');
      setFormData(prev => ({
        ...prev,
        file: null
      }));
      return;
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setFormData(prev => ({
        ...prev,
        file: null
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      file: selectedFile
    }));
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      if (formData.company_name) formDataToSend.append('company_name', formData.company_name);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('job_type', formData.job_type);
      formDataToSend.append('experience_level', formData.experience_level);
      if (formData.file) formDataToSend.append('file', formData.file);

      const response = await uploadJobDescription(formDataToSend);
      console.log('Upload response:', response);
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload job description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <h1>Upload Job Description</h1>
        <p className="upload-description">
          Upload a job description PDF and provide basic details.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            {typeof success === 'string' ? success : success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={255}
              className="form-input"
              placeholder="e.g., Senior Software Engineer"
            />
            <small className="text-gray-500">Maximum 255 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="company_name">Company Name</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              maxLength={255}
              className="form-input"
              placeholder="e.g., New York, NY"
            />
            <small className="text-gray-500">Maximum 255 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="job_type">Job Type *</label>
            <select
              id="job_type"
              name="job_type"
              value={formData.job_type}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="">Select Job Type</option>
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
              value={formData.experience_level}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="">Select Experience Level</option>
              <option value="ENTRY_LEVEL">Entry Level</option>
              <option value="MID_LEVEL">Mid Level</option>
              <option value="SENIOR_LEVEL">Senior Level</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="file">Upload PDF (Optional)</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="file"
                name="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="file" className="file-label">
                {formData.file ? formData.file.name : 'Choose PDF file'}
              </label>
            </div>
            <small className="text-gray-500">Maximum file size: 5MB. Only PDF files are accepted.</small>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.file}
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