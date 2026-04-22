import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './Contact.css';
import axios from 'axios';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/contact/send', formData);
      
      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setFormData({ name: '', email: '', subject: '', message: '' });
          setSubmitted(false);
        }, 5000);
      }
    } catch (err: any) {
      console.error('Contact form error:', err);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />
      
      <div className="page-content">
        <div className="container">
          <h1 className="page-title">Contact Us</h1>
          
          <div className="contact-content">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>
                Have questions about ChainSecure? We're here to help. Send us a message
                and we'll respond as soon as possible.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">📧</div>
                  <div>
                    <h3>Email</h3>
                    <p>cganesh_cse220574@mgit.ac.in</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div>
                    <h3>Phone</h3>
                    <p>+91 9876543210</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div>
                    <h3>Address</h3>
                    <p>Gandipet<br />Hyderabad</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">🕐</div>
                  <div>
                    <h3>Business Hours</h3>
                    <p>Monday - Friday: 9am - 5pm<br />Weekend: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>Send Message</h2>
              
              {submitted && (
                <div className="success-message">
                  ✅ Thank you! Your message has been sent successfully.
                </div>
              )}

              {error && (
                <div className="error-message" style={{
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  color: '#c33',
                  padding: '12px',
                  borderRadius: '5px',
                  marginBottom: '20px'
                }}>
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="input-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>

                <div className="input-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="input-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Message subject"
                  />
                </div>

                <div className="input-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={10}
                    placeholder="Your message..."
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
