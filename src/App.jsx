import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import JDUploadPage from './pages/JDUploadPage';



function App() {
<<<<<<< Updated upstream
=======
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log("Injecting token:", token);
    setAuthToken(token);
  }, []);

>>>>>>> Stashed changes
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/upload-resume" element={<ResumeUploadPage />} />
        <Route path="/upload-jd" element={<JDUploadPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;