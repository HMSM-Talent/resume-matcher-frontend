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
    setSelectedFile(e.target.files[0]);
    setErrorMsg('');
    setSuccessMsg('');
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

    const form = new FormData();
    form.append('file', selectedFile);

    try {
      await uploadResume(form);
      setSuccessMsg('Resume uploaded successfully.');
      setErrorMsg('');
      setShowConfirm(false);
      setResumeExists(true);
    } catch (err) {
      setErrorMsg('Upload failed. Ensure it’s a valid PDF and within the size limit.');
      setSuccessMsg('');
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

        <input type="file" onChange={handleFileChange} />

        {showConfirm ? (
          <div>
            <p>🚨 You already have a resume. Do you want to replace it?</p>
            <button onClick={handleUpload}>Yes, Replace</button>
            <button className="secondary-button" onClick={() => setShowConfirm(false)}>No, Keep Existing</button>
          </div>
        ) : (
          <button onClick={handleUpload}>Upload</button>
        )}

        <button className="secondary-button" onClick={handleBackToDashboard}>
          ⬅ Back to Dashboard
        </button>

        {errorMsg && <p className="error-text">{errorMsg}</p>}
        {successMsg && <p className="success-text">{successMsg}</p>}
      </div>
    </div>
  );
}

export default UploadResumePage;