function DashboardPage() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
  
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/user/');
        setUser(res.data);
      } catch (err) {
        console.error("Unauthorized:", err);
      }
    };
  
    fetchUser();
  }, []);

  const handleUpload = async (url) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('✅ File uploaded successfully.');
    } catch (err) {
      setMessage('❌ Upload failed.');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">
        Loading dashboard...
      </div>
    );
  }
}