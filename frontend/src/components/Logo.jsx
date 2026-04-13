import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="brand logo-link" aria-label="MoBooka home">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20c0-5.5 4.5-10 10-10h20c5.5 0 10 4.5 10 10v24c0 5.5-4.5 10-10 10H22c-5.5 0-10-4.5-10-10V20Z" fill="#1c223d" stroke="#5d8cff" strokeWidth="3"/>
          <path d="M22 16c0 6 5 10 10 10s10-4 10-10" stroke="#8cb7ff" strokeWidth="3" strokeLinecap="round"/>
          <path d="M36 14l6-6m0 0l6 6m-6-6v8" stroke="#8cb7ff" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </span>
      <span className="brand-name">MoBooka</span>
    </Link>
  );
}
