import React from 'react';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setSessionCentreId = useAuthStore((state) => state.setSessionCentreId);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <span style={styles.badge}>Live Regulated Environment</span>
      </div>

      <div style={styles.right}>
        <div style={styles.centreSelector}>
          <label style={styles.centreLabel}>Centre:</label>
          <select
            value={user?.centreId || 1}
            onChange={(e) => setSessionCentreId(Number(e.target.value))}
            style={styles.select}
          >
            <option value={1}>Centre 1 — Central Reference Lab (Bengaluru)</option>
            <option value={2}>Centre 2 — Nanjappa Hospital Main Lab</option>
            <option value={3}>Centre 3 — Satellite Collection Hub</option>
          </select>
        </div>

        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.fullName || 'Dr. Rajesh Sharma'}</span>
          <span style={styles.userRole}>{user?.roleName || 'Consultant Pathologist'}</span>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: '56px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
  },
  left: { display: 'flex', alignItems: 'center' },
  badge: {
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '3px 8px',
    borderRadius: '12px',
    border: '1px solid #bfdbfe',
  },
  right: { display: 'flex', alignItems: 'center', gap: '20px' },
  centreSelector: { display: 'flex', alignItems: 'center', gap: '8px' },
  centreLabel: { fontSize: '12px', color: '#64748b', fontWeight: 600 },
  select: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    backgroundColor: '#f8fafc',
  },
  userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  userName: { fontSize: '13px', fontWeight: 600, color: '#0f172a' },
  userRole: { fontSize: '11px', color: '#64748b' },
  logoutBtn: {
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};
