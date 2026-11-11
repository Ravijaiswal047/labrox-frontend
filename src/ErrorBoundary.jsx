import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error Boundary Caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          {/* Internal CSS (with !important allowed) */}
          <style>{`
            .error-container {
              height: 100vh !important;
              width: 100% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
            }

            .error-card {
              background: #fff !important;
              padding: 50px 40px !important;
              border-radius: 16px !important;
              box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
              max-width: 420px !important;
              width: 90% !important;
              text-align: center !important;
              animation: fadeIn 0.3s ease-in-out !important;
            }

            .error-icon {
              font-size: 60px !important;
              margin-bottom: 15px !important;
            }

            .error-title {
              font-size: 28px !important;
              font-weight: 700 !important;
              color: #333 !important;
              margin-bottom: 10px !important;
            }

            .error-text {
              font-size: 16px !important;
              color: #555 !important;
              margin-bottom: 25px !important;
              line-height: 1.5 !important;
            }

            .error-button {
              background-color: #4A90E2 !important;
              color: #fff !important;
              border: none !important;
              padding: 12px 24px !important;
              border-radius: 8px !important;
              font-size: 16px !important;
              cursor: pointer !important;
              transition: 0.2s !important;
            }

            .error-button:hover {
              background-color: #3b7bc4 !important;
            }

            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="error-container">
            <div className="error-card">
              <div className="error-icon">⚠️</div>

              <h1 className="error-title">Something went wrong</h1>

              <p className="error-text">
                An unexpected error occurred. Please try refreshing the page or
                 <strong> Contact the support team</strong>.
              </p>

              <button
                className="error-button"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
