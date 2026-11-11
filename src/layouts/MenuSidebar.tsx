import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { ChevronRight, Star, Folder } from 'lucide-react';

interface PageItem {
  pageId: number;
  pageName: string;
  pageUrl: string;
  favourite: boolean;
}

interface MenuItem {
  menuId: number;
  menuName: string;
  pages: PageItem[];
}

const DEFAULT_MENUS: MenuItem[] = [
  {
    menuId: -1,
    menuName: 'Quick Navigation',
    pages: [
      { pageId: 1, pageName: 'Main Dashboard', pageUrl: '/dashboard', favourite: true },
      { pageId: 2, pageName: 'Master Investigations', pageUrl: '/master/investigations', favourite: true },
      { pageId: 3, pageName: 'Phlebotomy Collection', pageUrl: '/phlebotomy', favourite: true },
      { pageId: 4, pageName: 'Result Entry Grid', pageUrl: '/diagnostic/results', favourite: true },
      { pageId: 5, pageName: 'Quality Control (QC)', pageUrl: '/qc', favourite: true },
      { pageId: 6, pageName: 'Pathologist Approvals', pageUrl: '/approvals', favourite: true },
      { pageId: 7, pageName: 'Diagnostic Reports', pageUrl: '/reports', favourite: true },
      { pageId: 8, pageName: 'Cron Automation', pageUrl: '/automation', favourite: true },
    ],
  },
];

export const MenuSidebar: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ['mainMenu', user?.companyId, user?.designationId, user?.userId],
    queryFn: async () => {
      if (!user) return DEFAULT_MENUS;
      try {
        const res = await apiClient.get('/iam/menu/main-menu', {
          params: {
            companyId: user.companyId,
            designationId: user.designationId,
            userId: user.userId,
          },
        });
        return res.data?.data && res.data.data.length > 0 ? res.data.data : DEFAULT_MENUS;
      } catch {
        return DEFAULT_MENUS;
      }
    },
    enabled: !!user,
    initialData: DEFAULT_MENUS,
  });

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandText}>LabRox LIMS</span>
      </div>
      <nav style={styles.nav}>
        {(menuItems || DEFAULT_MENUS).map((menu) => (
          <div key={menu.menuId} style={styles.menuGroup}>
            <div style={styles.menuHeader}>
              {menu.menuId === -1 ? <Star size={16} color="#f39c12" /> : <Folder size={16} />}
              <span style={styles.menuTitle}>{menu.menuName}</span>
            </div>
            <div style={styles.subList}>
              {menu.pages?.map((page) => (
                <NavLink
                  key={page.pageId}
                  to={page.pageUrl}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    backgroundColor: isActive ? '#1e3a8a' : 'transparent',
                    color: isActive ? '#ffffff' : '#c2c7d0',
                  })}
                >
                  <ChevronRight size={14} style={{ marginRight: 6 }} />
                  <span>{page.pageName}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '250px',
    height: '100vh',
    backgroundColor: '#1e293b',
    color: '#c2c7d0',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  brand: {
    padding: '16px',
    borderBottom: '1px solid #334155',
    textAlign: 'center',
  },
  brandText: { fontSize: '18px', fontWeight: 700, color: '#ffffff' },
  nav: { padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '8px' },
  menuGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  menuHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#94a3b8',
    fontWeight: 600,
  },
  menuTitle: { letterSpacing: '0.5px' },
  subList: { display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px' },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'background-color 0.2s',
  },
};
