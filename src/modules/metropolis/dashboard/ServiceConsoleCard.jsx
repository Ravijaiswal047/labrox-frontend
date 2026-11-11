const ServiceConsoleCard = () => {
  return (
    <div className="dashboard-card">
      <div className="header-row">
        <h5 className="card-title">Service Console</h5>
      </div>

      <div className="service-item">
        <span>Metropolis DOS</span>
        <span style={{ color: '#28a745', fontSize: '20px' }}>→</span>
      </div>

      <div className="service-item">
        <span>Partner Case Details</span>
        <span style={{ color: '#28a745', fontSize: '20px' }}>→</span>
      </div>
    </div>
  );
};

export default ServiceConsoleCard;