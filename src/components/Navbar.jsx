import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        Resume Matcher
      </div>
      <div className="navbar-menu">
        {user ? (
          <>
            <button onClick={() => navigate('/')} className="nav-link">
              Dashboard
            </button>
            {user.role.toLowerCase() === 'company' && (
              <>
                <button
                  onClick={() => navigate('/company/upload')}
                  className="nav-link"
                >
                  Upload Job Description
                </button>
                <button
                  onClick={() => navigate('/company/history')}
                  className="nav-link"
                >
                  Job History
                </button>
              </>
            )}
            {user.role.toLowerCase() === 'candidate' && (
              <>
                <button onClick={() => navigate('/candidate/search')} className="nav-link">
                  Search Jobs
                </button>
                <button onClick={() => navigate('/candidate/upload')} className="nav-link">
                  Upload Resume
                </button>
                <button onClick={() => navigate('/applications/history')} className="nav-link">
                  Application History
                </button>
              </>
            )}
            <button onClick={handleLogout} className="nav-link">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="nav-link">
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 