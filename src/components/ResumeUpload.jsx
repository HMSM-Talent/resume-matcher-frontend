import { useState } from 'react';
import FileUpload from './FileUpload';
import { resumeService } from '../api/resumes';

const ResumeUpload = () => {
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (formData) => {
    setError('');
    setSuccess('');

    try {
      // Add additional fields to formData
      if (title) formData.append('title', title);
      if (skills) formData.append('skills', skills);

      const response = await resumeService.uploadResume(formData);
      setSuccess('Resume uploaded successfully!');
      setTitle('');
      setSkills('');
      return response;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload resume');
      throw err;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Upload Resume</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Resume Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., Software Engineer Resume"
          />
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., Python, Django, React"
          />
        </div>

        <FileUpload
          onUpload={handleUpload}
          label="Upload Resume"
          buttonText="Upload Resume"
        />

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload; 