import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './SupportCenter.css';

interface SupportTicket {
  _id: string;
  ticketId: string;
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
}

const SupportCenter: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadTickets();
  }, [navigate]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/support/my-tickets');
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (err: any) {
      console.error('Error loading tickets:', err);
      setError(err.response?.data?.message || 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!category || !subject || !message) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('category', category);
      formData.append('subject', subject);
      formData.append('message', message);
      
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('documents', files[i]);
        }
      }

      const response = await api.post('/api/support/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Support ticket created successfully!');
        setCategory('');
        setSubject('');
        setMessage('');
        setFiles(null);
        setShowCreateModal(false);
        loadTickets();
      }
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTicket = async (ticketId: string) => {
    try {
      const response = await api.get(`/api/support/ticket/${ticketId}`);
      if (response.data.success) {
        setSelectedTicket(response.data.ticket);
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
      setError('');
      console.log('Sending reply to ticket:', selectedTicket.ticketId);
      
      const response = await api.post(`/api/support/reply/${selectedTicket.ticketId}`, {
        message: replyMessage
      });

      console.log('Reply response:', response.data);

      if (response.data.success) {
        // Update the ticket with new reply
        setSelectedTicket({
          ...selectedTicket,
          replies: [...selectedTicket.replies, response.data.reply]
        });
        setReplyMessage('');
        setSuccess('Reply sent successfully!');
        loadTickets(); // Refresh list
      }
    } catch (err: any) {
      console.error('Reply error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to send reply';
      setError(errorMsg);
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

  if (loading) {
    return (
      <div className="support-page">
        <div className="dashboard-header">
          <div className="dashboard-nav">
            <button className="nav-tab" onClick={() => navigate('/user-dashboard')}>🏠 Dashboard</button>
            <button className="nav-tab" onClick={() => navigate('/kyc-verification')}>📄 KYC Verification</button>
            <button className="nav-tab active">❓ Support Center</button>
          </div>
        </div>
        <div className="support-center">
          <div className="support-center-loading">Loading support center...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="support-page">
      {/* Navigation Header */}
      <div className="dashboard-header">
        <div className="dashboard-nav">
          <button className="nav-tab" onClick={() => navigate('/user-dashboard')}>🏠 Dashboard</button>
          <button className="nav-tab" onClick={() => navigate('/kyc-verification')}>📄 KYC Verification</button>
          <button className="nav-tab active">❓ Support Center</button>
        </div>
      </div>

      <div className="support-center">
        <div className="support-header">
          <h1>Support Center</h1>
          <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
            + Create New Ticket
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="tickets-list">
          {tickets.length === 0 ? (
            <div className="no-tickets">
              <p>No support tickets yet.</p>
              <button onClick={() => setShowCreateModal(true)}>Create Your First Ticket</button>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket._id} className="ticket-card">
                <div className="ticket-header">
                  <div>
                    <h3>{ticket.subject}</h3>
                    <span className="ticket-id">{ticket.ticketId}</span>
                  </div>
                  <div className="ticket-badges">
                    <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <div className="ticket-info">
                  <span className="ticket-category">📁 {ticket.category.replace(/_/g, ' ')}</span>
                  <span className="ticket-date">🕒 {formatDate(ticket.createdAt)}</span>
                  {ticket.replies.length > 0 && (
                    <span className="ticket-replies">💬 {ticket.replies.length} replies</span>
                  )}
                </div>
                <button className="view-ticket-btn" onClick={() => handleViewTicket(ticket.ticketId)}>
                  View Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Support Ticket</h2>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleCreateTicket}>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Select a category</option>
                    <option value="KYC_VERIFICATION">KYC Verification Issue</option>
                    <option value="ACCOUNT_BLOCKING">Account Blocking Issue</option>
                    <option value="TRANSACTION_ISSUE">Transaction Issue</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Attach Documents (Optional)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => setFiles(e.target.files)}
                  />
                  <small>Maximum 5 files, 5MB each (Images and PDFs only)</small>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Ticket Modal */}
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
                <div className="ticket-meta">
                  <span className={`status-badge ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  <span className="category-badge">
                    {selectedTicket.category.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="original-message">
                  <h3>Your Message:</h3>
                  <p>{selectedTicket.message}</p>
                  <span className="message-date">Submitted: {formatDate(selectedTicket.createdAt)}</span>
                </div>

                {selectedTicket.documents.length > 0 && (
                  <div className="ticket-documents">
                    <h3>Attached Documents:</h3>
                    <div className="documents-list">
                      {selectedTicket.documents.map((doc, index) => (
                        <div key={index} className="document-item">
                          <span>📎 {doc.originalName}</span>
                          <button onClick={() => handleViewDocument(selectedTicket.ticketId, index, doc.originalName)}>
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="replies-section">
                  <h3>Conversation:</h3>
                  {selectedTicket.replies.length === 0 ? (
                    <p className="no-replies">No replies yet. Our support team will respond soon.</p>
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

                  {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
                    <div className="reply-form">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        rows={3}
                      />
                      <button onClick={handleSendReply} disabled={submitting || !replyMessage.trim()}>
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
    </div>
  );
};

export default SupportCenter;
