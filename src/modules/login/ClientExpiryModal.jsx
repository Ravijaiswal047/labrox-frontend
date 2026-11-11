import React, { useEffect, useState } from 'react';
import Modal from '@components/formComponent/Modal';

const statusInfo = (days) => {
  if (days < 0)   return { badgeBg: '#fee2e2', badgeColor: '#dc2626', label: 'Expired' };
  if (days === 0) return { badgeBg: '#fef3c7', badgeColor: '#b45309', label: 'Expires Today' };
  if (days <= 30) return { badgeBg: '#fef3c7', badgeColor: '#b45309', label: `${days}d left` };
  return           { badgeBg: '#dcfce7', badgeColor: '#16a34a', label: `${days}d left` };
};

const th = { padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#374151', background: '#f8fafc', letterSpacing: '0.3px', whiteSpace: 'nowrap' };
const td = { padding: '9px 14px', fontSize: 12 };

const ClientExpiryModal = ({ data, message, onClose }) => {
  const expired    = data.filter(r => r.DaysLeft < 0).length;
  const nearExpiry = data.filter(r => r.DaysLeft >= 0 && r.DaysLeft <= 30).length;
  const isMobile   = window.innerWidth <= 768;

  const [activeFilter, setActiveFilter] = useState(null); // null | 'expired' | 'nearExpiry'

  const filteredData = activeFilter === 'expired'
    ? data.filter(r => r.DaysLeft < 0)
    : activeFilter === 'nearExpiry'
      ? data.filter(r => r.DaysLeft >= 0 && r.DaysLeft <= 30)
      : data;

  const toggleFilter = (key) => setActiveFilter(prev => prev === key ? null : key);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'cx-slide-anim';
    style.textContent = `
      @keyframes cxSlideFromTop {
        from { transform: translateY(-80px); opacity: 0; }
        to   { transform: translateY(0);     opacity: 1; }
      }
      .p-dialog { animation: cxSlideFromTop 0.4s cubic-bezier(0.34,1.2,0.64,1) !important; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById('cx-slide-anim')?.remove(); };
  }, []);

  const header = (
    <div className="d-flex align-items-center gap-2 w-100">
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 17, color: '#fbbf24' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Client Contract Expiry Alert</div>
        {message && <div style={{ fontSize: 11, opacity: 0.78, marginTop: 2 }}>{message}</div>}
      </div>
      <div className="d-flex gap-2 me-2">
        {expired > 0 && (
          <span
            onClick={() => toggleFilter('expired')}
            style={{
              background: activeFilter === 'expired' ? '#dc2626' : '#fef2f2',
              color: activeFilter === 'expired' ? '#fff' : '#dc2626',
              fontWeight: 700, fontSize: 11, padding: '3px 10px', borderRadius: 20,
              border: '1px solid #fca5a5', cursor: 'pointer', userSelect: 'none',
              transition: 'all 0.15s',
            }}
          >
            {expired} Expired
          </span>
        )}
        {nearExpiry > 0 && (
          <span
            onClick={() => toggleFilter('nearExpiry')}
            style={{
              background: activeFilter === 'nearExpiry' ? '#b45309' : '#fffbeb',
              color: activeFilter === 'nearExpiry' ? '#fff' : '#b45309',
              fontWeight: 700, fontSize: 11, padding: '3px 10px', borderRadius: 20,
              border: '1px solid #fcd34d', cursor: 'pointer', userSelect: 'none',
              transition: 'all 0.15s',
            }}
          >
            {nearExpiry} Near Expiry
          </span>
        )}
      </div>
    </div>
  );

  const footer = (
    <div className="d-flex justify-content-between align-items-center w-100">
      <span style={{ fontSize: 12, color: '#64748b' }}>
        {activeFilter ? `Showing ${filteredData.length} of ${data.length}` : `Total: ${data.length}`} client{data.length !== 1 ? 's' : ''} with contract issues
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          color: '#fff', border: 'none', borderRadius: 8,
          padding: '8px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Close &amp; Continue
      </button>
    </div>
  );

  return (
    <Modal
      visible={true}
      setVisible={onClose}
      Header={header}
      footer={footer}
      modalWidth={isMobile ? '95vw' : '60vw'}
    >
      <style>{`.cx-row:hover td { background: #fef2f2 !important; }`}</style>
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
              <th style={{ ...th, width: 44 }}>#</th>
              <th style={th}>BusinessUnit</th>
              <th style={th}>RateTypeCode</th>
              <th style={th}>RateTypeName</th>
              <th style={th}>Contract From</th>
              <th style={th}>Contract To</th>
              <th style={{ ...th, textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => {
              const s = statusInfo(row.DaysLeft);
              return (
                <tr key={row.CentreId} className="cx-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...td, color: '#94a3b8', fontSize: 11 }}>{i + 1}</td>
                   <td style={{ ...td, color: '#64748b' }}>{row.BusinessUnit}</td>
                  <td style={{ ...td, fontWeight: 600, color: '#1e293b' }}>{row.RateTypeCode}</td>
                  <td style={{ ...td, fontWeight: 600, color: '#1e293b' }}>{row.RateTypeName}</td>
                  <td style={{ ...td, color: '#64748b' }}>{row.ContractFromDate}</td>
                  <td style={{ ...td, color: '#64748b' }}>{row.ContractToDate}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{
                      background: s.badgeBg, color: s.badgeColor,
                      padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      border: `1px solid ${s.badgeColor}30`, display: 'inline-block',
                    }}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default ClientExpiryModal;
