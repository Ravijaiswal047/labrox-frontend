import React from 'react';
import { Outlet } from 'react-router-dom';
import { MenuSidebar } from './MenuSidebar';
import { Header } from './Header';
import { useIdleLogout } from '@/hooks/useIdleLogout';

export const AppLayout: React.FC = () => {
  useIdleLogout();

  return (
    <div style={styles.container}>
      <MenuSidebar />
      <div style={styles.main}>
        <Header />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#f8fafc',
  },
};
