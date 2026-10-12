
const LogoutModal = ({ onClose }) => {
  return (
    <>
      <style>{`
        .logout-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .logout-card {
          overflow: hidden;
          position: relative;
          background-color: #ffffff;
          text-align: left;
          border-radius: 0.5rem;
          max-width: 290px;
          width: 100%;
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: modal-enter 0.3s ease-out;
        }
        
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .logout-card .header {
          padding: 1.25rem 1rem 1rem 1rem;
          background-color: #ffffff;
        }

        .logout-card .image {
          display: flex;
          margin-left: auto;
          margin-right: auto;
          background-color: rgba(123, 31, 42, 0.1);
          flex-shrink: 0;
          justify-content: center;
          align-items: center;
          width: 3rem;
          height: 3rem;
          border-radius: 9999px;
        }

        .logout-card .image svg {
          color: #7B1F2A;
          width: 1.5rem;
          height: 1.5rem;
        }

        .logout-card .content {
          margin-top: 0.75rem;
          text-align: center;
        }

        .logout-card .title {
          color: #111827;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.5rem;
        }

        .logout-card .message {
          margin-top: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }

        .logout-card .actions {
          margin: 1rem 1rem 0.75rem 1rem;
        }

        .logout-card .desactivate {
          display: inline-flex;
          padding: 0.5rem 1rem;
          background-color: #7B1F2A;
          color: #ffffff;
          font-size: 1rem;
          line-height: 1.5rem;
          font-weight: 500;
          justify-content: center;
          width: 100%;
          border-radius: 0.375rem;
          border-width: 1px;
          border-color: transparent;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .logout-card .desactivate:hover {
          background-color: #4E1218;
        }
      `}</style>
      <div className="logout-modal-overlay" onClick={onClose}>
        <div className="logout-card" onClick={(e) => e.stopPropagation()}>
          <div className="header">
            <div className="image">
              <svg aria-hidden="true" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="content">
              <span className="title">Logged Out</span>
              <p className="message">
                You have been successfully logged out of your account. We hope to see you again soon!
              </p>
            </div>
            <div className="actions">
              <button className="desactivate" type="button" onClick={onClose}>OK</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LogoutModal;
