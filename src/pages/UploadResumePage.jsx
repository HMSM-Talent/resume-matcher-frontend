import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume } from '../api/api';
import '../styles/Upload.css';

function UploadResumePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
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

      await uploadResume(formData);
      setSuccess('Resume uploaded successfully!');
      setFile(null);
      e.target.reset();
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/candidate/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <h1>Upload Resume</h1>
        <p className="upload-description">
          Upload your resume in PDF format to get started with job matching.
        </p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-upload-container">
            <input
              type="file"
              id="resume"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="resume" className="file-label">
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
            {loading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadResumePage;