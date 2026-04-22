import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminSupportCenter.css';

interface SupportTicket {
  _id: string;
  ticketId: string;
  userId: {
    name: string;
    email: string;
    walletAddress: string;
  };
  category: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  documents: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
  }>;
  replies: Array<{
    message: string;
    repliedBy: {
      name: string;
      email: string;
      role: string;
    };
    repliedAt: string;
    isAdmin: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: {
    name: string;
    email: string;
  };
}

interface TicketStats {
  total: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

const AdminSupportCenter: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTickets();
    loadStats();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/support/admin/all-tickets');
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (err: any) {
      console.error('Error loading tickets:', err);
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/support/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  const handleViewTicket = async (ticketId: string) => {
    try {
      const response = await api.get(`/api/support/ticket/${ticketId}`);
      if (response.data.success) {
        setSelectedTicket(response.data.ticket);
        setNewStatus(response.data.ticket.status);
        setShowTicketModal(true);
      }
    } catch (err: any) {
      setError('Failed to load ticket details');
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post(`/api/support/reply/${selectedTicket.ticketId}`, {
        message: replyMessage
      });

      if (response.data.success) {
        setSelectedTicket({
          ...selectedTicket,
          replies: [...selectedTicket.replies, response.data.reply],
          status: 'IN_PROGRESS'
        });
        setReplyMessage('');
        setSuccess('Reply sent successfully');
        loadTickets();
        loadStats();
      }
    } catch (err: any) {
      setError('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      setSubmitting(true);
      const response = await api.put(`/api/support/admin/update-status/${selectedTicket.ticketId}`, {
        status: newStatus
      });

      if (response.data.success) {
        setSuccess('Ticket status updated successfully');
        loadTickets();
        loadStats();
        
        // Update local state
        setSelectedTicket({
          ...selectedTicket,
          status: newStatus
        });
      }
    } catch (err: any) {
      setError('Failed to update ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDocument = async (ticketId: string, index: number, filename: string) => {
    try {
      const response = await api.get(`/api/support/document/${ticketId}/${index}`, {
        responseType: 'blob'
      });
      
      // Get the content type from response headers or use a default
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      console.error('Error viewing document:', err);
      setError('Failed to view document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'RESOLVED': return 'status-resolved';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'priority-urgent';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== 'ALL' && ticket.status !== filterStatus) return false;
    
    // Date range filtering
    if (filterStartDate) {
      const ticketDate = new Date(ticket.createdAt);
      const startDate = new Date(filterStartDate);
      if (ticketDate < startDate) return false;
    }
    if (filterEndDate) {
      const ticketDate = new Date(ticket.createdAt);
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      if (ticketDate > endDate) return false;
    }
    
    return true;
  });

  if (loading) {
    return <div className="admin-support-loading">Loading support tickets...</div>;
  }

  return (
    <div className="admin-support-center">
      <div className="admin-support-header">
        <h1>Support Center - Admin</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Statistics Cards */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '2rem'
      }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#667eea' }}>{stats.total}</div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>TOTAL TICKETS</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#f59e0b' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>IN PROGRESS</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#10b981' }}>{stats.resolved}</div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>RESOLVED</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#6b7280' }}>{stats.closed}</div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>CLOSED</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Start Date:</label>
          <input 
            type="date" 
            value={filterStartDate} 
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input 
            type="date" 
            value={filterEndDate} 
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="tickets-table-container">
        {filteredTickets.length === 0 ? (
          <div className="no-tickets">No tickets found matching your filters.</div>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>User</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="ticket-id-cell">{ticket.ticketId}</td>
                  <td>
                    <div className="user-info">
                      <div>{ticket.userId.name}</div>
                      <div className="user-email">{ticket.userId.email}</div>
                    </div>
                  </td>
                  <td>{ticket.category.replace(/_/g, ' ')}</td>
                  <td className="subject-cell">{ticket.subject}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>{formatDate(ticket.createdAt)}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewTicket(ticket.ticketId)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedTicket.subject}</h2>
                <span className="ticket-id-large">{selectedTicket.ticketId}</span>
              </div>
              <button className="close-btn" onClick={() => setShowTicketModal(false)}>×</button>
            </div>

            <div className="ticket-details">
              {/* User Information */}
              <div className="user-details">
                <h3>User Information:</h3>
                <div className="user-grid">
                  <div><strong>Name:</strong> {selectedTicket.userId.name}</div>
                  <div><strong>Email:</strong> {selectedTicket.userId.email}</div>
                  <div><strong>Wallet:</strong> {selectedTicket.userId.walletAddress}</div>
                </div>
              </div>

              {/* Ticket Management */}
              <div className="ticket-management">
                <h3>Ticket Management:</h3>
                <div className="management-controls">
                  <div className="control-group">
                    <label>Status:</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <button className="update-btn" onClick={handleUpdateTicket} disabled={submitting}>
                    Update Status
                  </button>
                </div>
              </div>

              {/* Ticket Metadata */}
              <div className="ticket-meta-section">
                <span className={`status-badge ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
                <span className="category-badge">
                  {selectedTicket.category.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Original Message */}
              <div className="original-message">
                <h3>User's Message:</h3>
                <p>{selectedTicket.message}</p>
                <span className="message-date">Submitted: {formatDate(selectedTicket.createdAt)}</span>
              </div>

              {/* Documents */}
              {selectedTicket.documents.length > 0 && (
                <div className="ticket-documents">
                  <h3>Attached Documents ({selectedTicket.documents.length}):</h3>
                  <div className="documents-grid">
                    {selectedTicket.documents.map((doc, index) => (
                      <div key={index} className="document-card">
                        <div className="document-icon">📎</div>
                        <div className="document-info">
                          <div className="document-name">{doc.originalName}</div>
                          <div className="document-meta">
                            {(doc.size / 1024).toFixed(2)} KB • {doc.mimetype}
                          </div>
                        </div>
                        <button 
                          className="view-doc-btn"
                          onClick={() => handleViewDocument(selectedTicket.ticketId, index, doc.originalName)}
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation */}
              <div className="replies-section">
                <h3>Conversation ({selectedTicket.replies.length} replies):</h3>
                {selectedTicket.replies.length === 0 ? (
                  <p className="no-replies">No replies yet.</p>
                ) : (
                  <div className="replies-list">
                    {selectedTicket.replies.map((reply, index) => (
                      <div key={index} className={`reply-item ${reply.isAdmin ? 'admin-reply' : 'user-reply'}`}>
                        <div className="reply-header">
                          <strong>{reply.repliedBy.name}</strong>
                          {reply.isAdmin && <span className="admin-badge">Admin</span>}
                          <span className="reply-date">{formatDate(reply.repliedAt)}</span>
                        </div>
                        <p className="reply-message">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin Reply Form */}
                {selectedTicket.status !== 'CLOSED' && (
                  <div className="admin-reply-form">
                    <h4>Send Reply to User:</h4>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply to the user..."
                      rows={4}
                    />
                    <button 
                      className="send-reply-btn"
                      onClick={handleSendReply} 
                      disabled={submitting || !replyMessage.trim()}
                    >
                      {submitting ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportCenter;
