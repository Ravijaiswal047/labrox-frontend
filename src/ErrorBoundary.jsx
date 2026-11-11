import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      correlationId: null,
    };
  }

  static getDerivedStateFromError(error) {
    const cid = "ERR-GUI-" + Date.now().toString(36).toUpperCase();
    return { hasError: true, error, correlationId: cid };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary] Correlation ID: ${this.state.correlationId}`, error, info);
    this.setState({ errorInfo: info });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, correlationId: null });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, correlationId } = this.state;
      const errorMsg = error?.message || "An unexpected application error occurred";

      return (
        <>
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
              padding: 40px !important;
              border-radius: 14px !important;
              box-shadow: 0 8px 25px rgba(0,0,0,0.12) !important;
              max-width: 580px !important;
              width: 90% !important;
              text-align: left !important;
              animation: fadeIn 0.3s ease-in-out !important;
            }

            .error-badge {
              display: inline-block !important;
              background: #fee2e2 !important;
              color: #b91c1c !important;
              font-size: 11px !important;
              font-weight: 600 !important;
              padding: 4px 8px !important;
              border-radius: 4px !important;
              margin-bottom: 12px !important;
              font-family: monospace !important;
            }

            .error-title {
              font-size: 22px !important;
              font-weight: 700 !important;
              color: #1e293b !important;
              margin-bottom: 8px !important;
            }

            .error-text {
              font-size: 14px !important;
              color: #475569 !important;
              margin-bottom: 16px !important;
              line-height: 1.5 !important;
            }

            .error-details {
              background: #f8fafc !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 6px !important;
              padding: 12px !important;
              margin-bottom: 20px !important;
              font-family: monospace !important;
              font-size: 12px !important;
              color: #334155 !important;
              max-height: 140px !important;
              overflow-y: auto !important;
              word-break: break-all !important;
            }

            .error-actions {
              display: flex !important;
              gap: 10px !important;
              justify-content: flex-end !important;
            }

            .error-btn-primary {
              background-color: #2563eb !important;
              color: #fff !important;
              border: none !important;
              padding: 10px 18px !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
              transition: 0.15s !important;
            }

            .error-btn-primary:hover {
              background-color: #1d4ed8 !important;
            }

            .error-btn-secondary {
              background-color: #f1f5f9 !important;
              color: #334155 !important;
              border: 1px solid #cbd5e1 !important;
              padding: 10px 18px !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
              transition: 0.15s !important;
            }

            .error-btn-secondary:hover {
              background-color: #e2e8f0 !important;
            }

            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="error-container">
            <div className="error-card">
              <span className="error-badge">Diagnostic Safety Intercept &bull; Ref: {correlationId}</span>
              <h1 className="error-title">Application Component Error</h1>
              <p className="error-text">
                An unexpected interface issue was caught safely to protect clinical record integrity.
                Please retry the action or reload the module.
              </p>

              <div className="error-details">
                <strong>Error:</strong> {errorMsg}
                {errorInfo?.componentStack && (
                  <pre style={{ marginTop: "6px", fontSize: "11px", color: "#64748b" }}>
                    {errorInfo.componentStack.slice(0, 300)}...
                  </pre>
                )}
              </div>

              <div className="error-actions">
                <button
                  type="button"
                  className="error-btn-secondary"
                  onClick={this.handleReset}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  className="error-btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
