import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus({ type: 'error', text: 'Please fill in all fields before sending your message.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to send message');
      setForm({ name: '', email: '', subject: '', message: '' });
      setStatus({ type: 'success', text: 'Message sent successfully. Our support team will reply soon.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Failed to send message. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Contact MoBooka</span>
          <h1>Need help? Send us a message.</h1>
          <p>Our team is ready to assist with payments, uploads, downloads, and author support.</p>
        </div>
        <div className="contact-summary card">
          <h2>Quick support</h2>
          <p>Reach us directly via email or phone. Include your registered account email and payment reference for faster resolution.</p>
          <p><strong>Email:</strong> <a href="mailto:titechaafrica@gmail.com">titechaafrica@gmail.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:+256782397907">+256 782 397 907</a></p>
        </div>
      </div>
      <form className="contact-form card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-group">
            <span>Name</span>
            <input type="text" value={form.name} onChange={handleChange('name')} placeholder="Your name" />
          </label>
          <label className="form-group">
            <span>Email</span>
            <input type="email" value={form.email} onChange={handleChange('email')} placeholder="you@example.com" />
          </label>
        </div>
        <label className="form-group">
          <span>Subject</span>
          <input type="text" value={form.subject} onChange={handleChange('subject')} placeholder="Payment issue, book upload, general inquiry" />
        </label>
        <label className="form-group">
          <span>Message</span>
          <textarea value={form.message} onChange={handleChange('message')} rows="6" placeholder="Tell us how we can help." />
        </label>
        {status ? (
          <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`}>{status.text}</div>
        ) : null}
        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Sending message...' : 'Send message'}
        </button>
      </form>
    </div>
  );
}
