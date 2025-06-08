import { useEffect, useState } from 'react';
import { getCurrentUser, uploadResume } from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

function UploadResumePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeExists, setResumeExists] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
        if (res.data.resume_id) {
          setResumeExists(true);
        }
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
      setSelectedFile(null);
    } catch (err) {
      setErrorMsg('Upload failed. Ensure it\'s a valid PDF and within the size limit.');
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
            <h2>{user.first_name ? `${user.first_name}'s Dashboard` : 'Candidate Dashboard'}</h2>
            <p>Welcome back!</p>
          </div>
          
          <div className="sidebar-menu">
            <button onClick={() => navigate('/candidate/dashboard')}>
              <span>📊 Overview</span>
            </button>
            <button className="active">
              <span>📝 Upload Resume</span>
            </button>
            <button onClick={() => navigate('/candidate/dashboard', { state: { editProfile: true } })}>
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
            <h1>Upload Resume</h1>
          </div>

          <div className="filters-section">
            <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-4">
              {errorMsg && <div className="error-message">{errorMsg}</div>}
              {successMsg && <div className="success-message">{successMsg}</div>}

              <div className="filter-group">
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
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="btn btn-secondary"
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
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
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="btn btn-primary"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/candidate/dashboard')}
                    className="btn btn-secondary"
                    disabled={isUploading}
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UploadResumePage;