import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import '../styles/Layout.css';

function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div className="layout">
      <Navbar user={user} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout; 