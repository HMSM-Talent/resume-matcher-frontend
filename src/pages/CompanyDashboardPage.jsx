import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile } from '../api/api';
import CompanyJobListings from '../components/CompanyJobListings';
import '../styles/Dashboard.css';

function CompanyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone_number: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getCurrentUser();
        setUser(userRes.data);
        setFormData({
          company_name: userRes.data.company_name || '',
          email: userRes.data.email || '',
          phone_number: userRes.data.phone_number || ''
        });
      } catch (err) {
        setError('Failed to load user data.');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUserProfile(formData);
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      setError('Update failed');
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

  if (error) return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="error-message">{error}</div>
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
            <button className="active">
              <span>📊 Overview</span>
            </button>
            <button onClick={() => navigate('/upload-jd')}>
              <span>📝 Upload Job Description</span>
            </button>
            <button onClick={() => setIsEditing(!isEditing)}>
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
            <h1>Company Overview</h1>
            {isEditing && (
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel Editing
              </button>
            )}
          </div>

          {/* Profile Edit Form */}
          {isEditing && (
            <div className="filters-section">
              <h3 className="text-lg font-semibold mb-4">Edit Company Profile</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="filter-group">
                  <label htmlFor="company_name">Company Name</label>
                  <input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="phone_number">Phone Number</label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Job Listings */}
          {!isEditing && <CompanyJobListings />}
        </main>
      </div>
    </div>
  );
}

export default CompanyDashboard;