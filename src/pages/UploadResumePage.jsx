import { useEffect, useState } from 'react';
import { getCurrentUser, uploadResume } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './UploadResumePage.css';

function UploadResumePage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeExists, setResumeExists] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.data.resume_id) {
          setResumeExists(true);
        }
        setRole(res.data.role);
      } catch (err) {
        console.error('Failed to fetch user info');
      }
    };
    fetchUser();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size must be less than 5MB');
        setSelectedFile(null);
        return;
      }
      // Check file type
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (!validTypes.includes(fileExtension)) {
        setErrorMsg('Please upload a PDF or Word document');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a file first.');
      return;
    }

    if (resumeExists && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const form = new FormData();
    form.append('file', selectedFile);

    try {
      await uploadResume(form);
      setSuccessMsg('Resume uploaded successfully.');
      setErrorMsg('');
      setShowConfirm(false);
      setResumeExists(true);
    } catch (err) {
      setErrorMsg('Upload failed. Ensure it\'s a valid PDF and within the size limit.');
      setSuccessMsg('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackToDashboard = () => {
    if (role === 'candidate') {
      navigate('/candidate/dashboard');
    } else if (role === 'company') {
      navigate('/company/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="upload-resume-container">
      <div className="upload-resume-card">
        <h2>Upload Resume</h2>
        <p className="subtitle">Upload your resume to get started</p>

        {errorMsg && <div className="error-message">{errorMsg}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        <div className="form-group">
          <label htmlFor="file">Resume File *</label>
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

        {showConfirm && (
          <div className="confirmation-message">
            <p>You already have a resume uploaded. Uploading a new one will replace the existing one.</p>
            <div className="button-group">
              <button
                onClick={() => setShowConfirm(false)}
                className="secondary-button"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="primary-button"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Confirm Upload'}
              </button>
            </div>
          </div>
        )}

        {!showConfirm && (
          <div className="button-group">
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="primary-button"
            >
              {isUploading ? 'Uploading...' : 'Upload Resume'}
            </button>
            <button
              onClick={handleBackToDashboard}
              className="secondary-button"
              disabled={isUploading}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadResumePage;