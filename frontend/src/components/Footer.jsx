import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-shell">
      <div className="footer-content">
        <div className="footer-column">
          <h3>MoBooka</h3>
          <p>Digital books, African voices, mobile-first reading experiences.</p>
        </div>
        <div className="footer-column">
          <h3>Quick links</h3>
          <nav className="footer-nav">
            <Link to="/books">Browse books</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/support">Support</Link>
          </nav>
        </div>
        <div className="footer-column">
          <h3>Contact</h3>
          <p><strong>Email:</strong> <a href="mailto:titechaafrica@gmail.com">titechaafrica@gmail.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:+256782397907">+256 782 397 907</a></p>
          <p>Support hours: Mon-Fri, 08:00 - 18:00 EAT</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 MoBooka. Built for mobile-first readers.</span>
        <span>Powered by African stories and secure Mobile Money payments.</span>
      </div>
    </footer>
  );
}
