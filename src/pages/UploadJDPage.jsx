import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadJobDescription } from '../api/api';
import './UploadJDPage.css';

function UploadJDPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadSuccess('');
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await uploadJobDescription(formData);
      setUploadSuccess('Job description uploaded successfully.');
      setUploadError('');
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed.');
      setUploadSuccess('');
    }
  };

  return (
    <div className="upload-jd-container">
      <div className="upload-jd-card">
        <h2>Upload Job Description</h2>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />

        {uploadError && <p className="error-text">{uploadError}</p>}
        {uploadSuccess && <p className="success-text">{uploadSuccess}</p>}

        <button onClick={handleUpload}>Upload</button>
        <button className="secondary-button" onClick={() => navigate('/company/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default UploadJDPage;