export default function Support() {
  return (
    <div className="page-shell">
      <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
        <span className="eyebrow">Support</span>
        <h1>MoBooka customer support</h1>
        <p>If you need help with accounts, payments, uploads, or downloads, our support team is ready to assist.</p>
      </div>
      <div className="grid grid-2" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="card">
          <h2>Contact details</h2>
          <p><strong>Email:</strong> <a href="mailto:titechaafrica@gmail.com">titechaafrica@gmail.com</a></p>
          <p><strong>Telephone:</strong> <a href="tel:+256782397907">+256782397907</a></p>
          <p><strong>Support hours:</strong> Monday to Friday, 08:00 - 18:00 EAT</p>
        </div>
        <div className="card">
          <h2>How to get faster help</h2>
          <ul>
            <li>Send your registered email.</li>
            <li>Include the book title and payment reference.</li>
            <li>Tell us whether you are buyer, author, or admin.</li>
          </ul>
          <p>For urgent issues, use the <a href="/contact">contact page</a> to message us directly.</p>
        </div>
      </div>
    </div>
  );
}
