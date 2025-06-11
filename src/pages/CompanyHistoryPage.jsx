import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CompanyHistoryPage.css';

const CompanyHistoryPage = () => {
  console.log("CompanyHistoryPage is rendering");

  // Sample data - replace with actual data from your backend
  const hiringHistory = [
    {
      id: 1,
      candidate: 'John Smith',
      position: 'Senior Software Engineer',
      date: '2024-03-15',
      status: 'Under Review',
      matchScore: '92%',
      experience: '8 years',
      skills: ['React', 'Node.js', 'AWS']
    },
    {
      id: 2,
      candidate: 'Sarah Johnson',
      position: 'Full Stack Developer',
      date: '2024-03-10',
      status: 'Interview Scheduled',
      matchScore: '88%',
      experience: '5 years',
      skills: ['Python', 'Django', 'PostgreSQL']
    },
    {
      id: 3,
      candidate: 'Michael Chen',
      position: 'Frontend Developer',
      date: '2024-03-05',
      status: 'Application Submitted',
      matchScore: '85%',
      experience: '3 years',
      skills: ['Vue.js', 'TypeScript', 'CSS']
    }
  ];

  return (
    <div className="page-container">
      <Navbar />
      <div className="company-history-container">
        <div className="history-header">
          <h1>Hiring History</h1>
        </div>
        
        <div className="history-filters">
          <div className="search-box">
            <input type="text" placeholder="Search candidates..." />
          </div>
          <div className="filter-options">
            <select>
              <option value="">All Positions</option>
              <option value="senior">Senior Software Engineer</option>
              <option value="fullstack">Full Stack Developer</option>
              <option value="frontend">Frontend Developer</option>
            </select>
            <select>
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="review">Under Review</option>
              <option value="interview">Interview</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <select>
              <option value="">Sort By</option>
              <option value="date">Date</option>
              <option value="score">Match Score</option>
              <option value="experience">Experience</option>
            </select>
          </div>
        </div>

        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position</th>
                <th>Experience</th>
                <th>Skills</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th>Match Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hiringHistory.map((application) => (
                <tr key={application.id}>
                  <td>{application.candidate}</td>
                  <td>{application.position}</td>
                  <td>{application.experience}</td>
                  <td>
                    <div className="skills-tags">
                      {application.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </td>
                  <td>{application.date}</td>
                  <td>
                    <span className={`status-badge ${application.status.toLowerCase().replace(' ', '-')}`}>
                      {application.status}
                    </span>
                  </td>
                  <td>{application.matchScore}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view">View Profile</button>
                      <button className="action-btn schedule">Schedule Interview</button>
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button>
                      <button className="action-btn reject">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="pagination-btn">Previous</button>
          <span className="page-number">Page 1 of 1</span>
          <button className="pagination-btn">Next</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyHistoryPage; 