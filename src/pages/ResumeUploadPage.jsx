import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function ResumeUploadPage() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/user/');
        setUser(res.data);
        if (res.data.role !== 'candidate') {
          navigate('/dashboard');
        }
      } catch {
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpload = async () => {
    if (!file) return setMessage("Please select a file.");

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/api/upload-resume/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage("Resume uploaded successfully.");
    } catch (err) {
      setMessage("Upload failed.");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload
      </button>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}

export default ResumeUploadPage;