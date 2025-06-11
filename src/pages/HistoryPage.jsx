import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './HistoryPage.css';

const CandidateHistoryPage = () => {
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    company: '',
    status: '',
    date: ''
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Mock data - Replace with actual API call
  useEffect(() => {
    // Simulated API call
    const mockApplications = [
      {
        id: 1,
        company: 'Tech Corp',
        position: 'Senior Developer',
        appliedDate: '2024-03-15',
        status: 'interviewed',
        lastUpdated: '2024-03-20',
        description: 'Full-stack development role with focus on React and Node.js',
        requirements: ['React', 'Node.js', 'AWS', '5+ years experience'],
        salary: '$120,000 - $150,000',
        location: 'New York, NY'
      },
      {
        id: 2,
        company: 'Digital Solutions',
        position: 'Frontend Developer',
        appliedDate: '2024-03-10',
        status: 'applied',
        lastUpdated: '2024-03-10',
        description: 'Frontend development role with focus on modern JavaScript frameworks',
        requirements: ['React', 'TypeScript', 'CSS', '3+ years experience'],
        salary: '$90,000 - $110,000',
        location: 'Remote'
      },
      {
        id: 3,
        company: 'Innovation Labs',
        position: 'Full Stack Developer',
        appliedDate: '2024-03-05',
        status: 'offered',
        lastUpdated: '2024-03-18',
        description: 'Full-stack role working on innovative products',
        requirements: ['JavaScript', 'Python', 'SQL', '4+ years experience'],
        salary: '$100,000 - $130,000',
        location: 'San Francisco, CA'
      },
      {
        id: 4,
        company: 'StartUp Inc',
        position: 'React Developer',
        appliedDate: '2024-03-01',
        status: 'rejected',
        lastUpdated: '2024-03-15',
        description: 'React development role in a fast-paced startup environment',
        requirements: ['React', 'Redux', 'GraphQL', '2+ years experience'],
        salary: '$85,000 - $100,000',
        location: 'Boston, MA'
      }
    ];
    setApplications(mockApplications);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setIsEditModalOpen(true);
  };

  const handleDelete = (application) => {
    setSelectedApplication(application);
    setIsDeleteModalOpen(true);
  };

  const handleView = (application) => {
    setSelectedApplication(application);
    setIsViewModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update the application
    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id ? selectedApplication : app
    ));
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    // Here you would typically make an API call to delete the application
    setApplications(prev => prev.filter(app => app.id !== selectedApplication.id));
    setIsDeleteModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredApplications = applications.filter(app => {
    return (
      app.company.toLowerCase().includes(filters.company.toLowerCase()) &&
      (filters.status === '' || app.status === filters.status) &&
      (filters.date === '' || app.appliedDate === filters.date)
    );
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="history-container">
        <div className="history-header">
          <h1>Application History</h1>
        </div>

        <div className="history-filters">
          <div className="search-box">
            <input
              type="text"
              name="company"
              placeholder="Search by company..."
              className="filter-input"
              value={filters.company}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-options">
            <select
              name="status"
              className="filter-input"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="interviewed">Interviewed</option>
              <option value="offered">Offered</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="date"
              name="date"
              className="filter-input"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApplications.map(app => (
                <tr key={app.id}>
                  <td>{app.company}</td>
                  <td>{app.position}</td>
                  <td>{formatDate(app.appliedDate)}</td>
                  <td>
                    <span className={getStatusBadgeClass(app.status)}>
                      {app.status}
                    </span>
                  </td>
                  <td>{formatDate(app.lastUpdated)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" onClick={() => handleView(app)}>View</button>
                      <button className="action-btn edit" onClick={() => handleEdit(app)}>Edit</button>
                      <button className="action-btn delete" onClick={() => handleDelete(app)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-number">Page {currentPage} of {totalPages}</span>
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        {/* View Modal */}
        {isViewModalOpen && selectedApplication && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Application Details</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="close-btn">&times;</button>
              </div>
              <div className="modal-content">
                <div className="detail-row">
                  <strong>Company:</strong> {selectedApplication.company}
                </div>
                <div className="detail-row">
                  <strong>Position:</strong> {selectedApplication.position}
                </div>
                <div className="detail-row">
                  <strong>Description:</strong> {selectedApplication.description}
                </div>
                <div className="detail-row">
                  <strong>Requirements:</strong>
                  <ul>
                    {selectedApplication.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                <div className="detail-row">
                  <strong>Salary:</strong> {selectedApplication.salary}
                </div>
                <div className="detail-row">
                  <strong>Location:</strong> {selectedApplication.location}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span className={getStatusBadgeClass(selectedApplication.status)}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Applied Date:</strong> {formatDate(selectedApplication.appliedDate)}
                </div>
                <div className="detail-row">
                  <strong>Last Updated:</strong> {formatDate(selectedApplication.lastUpdated)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedApplication && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Edit Application</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="close-btn">&times;</button>
              </div>
              <form onSubmit={handleEditSubmit} className="modal-content">
                <div className="form-group">
                  <label>Company:</label>
                  <input
                    type="text"
                    name="company"
                    value={selectedApplication.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Position:</label>
                  <input
                    type="text"
                    name="position"
                    value={selectedApplication.position}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={selectedApplication.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Applied Date:</label>
                  <input
                    type="date"
                    name="appliedDate"
                    value={selectedApplication.appliedDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && selectedApplication && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Confirm Delete</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="close-btn">&times;</button>
              </div>
              <div className="modal-content">
                <p>Are you sure you want to delete this application?</p>
                <div className="delete-details">
                  <strong>{selectedApplication.company}</strong> - {selectedApplication.position}
                </div>
                <div className="modal-actions">
                  <button onClick={handleDeleteConfirm} className="delete-confirm-btn">
                    Delete
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CandidateHistoryPage;