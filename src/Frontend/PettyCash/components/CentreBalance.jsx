import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Accordion from '@components/UI/Accordion';
import { CustomButton } from '@components/UI/CustomButton';
import { useLocalStorage } from '@app/utils/hooks/useLocalStorage';
import { axiosInstance } from '@app/utils/axiosInstance';
import { toast } from 'react-toastify';

const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const S = {
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
  },
  kpiCard: (border) => ({
    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12,
    background: '#fff', borderRadius: 10, padding: '13px 16px',
    borderLeft: `4px solid ${border}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.04)',
    minHeight: 74, boxSizing: 'border-box',
  }),
  kpiIcon: (bg) => ({
    width: 40, height: 40, minWidth: 40, borderRadius: 10, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }),
  kpiAmount: (color) => ({ fontSize: 22, fontWeight: 800, lineHeight: 1, color, letterSpacing: '-0.5px' }),
  kpiLabel:  { fontSize: 11, color: '#64748b', marginTop: 3, fontWeight: 500 },
  kpiSub:    { fontSize: 10, color: '#94a3b8', marginTop: 1 },
  centreGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  centreCard: {
    background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden',
  },
  centreHeader: (pct) => ({
    background: pct >= 90 ? '#fef2f2' : pct >= 70 ? '#fffbeb' : '#f0fdf4',
    borderBottom: `1px solid ${pct >= 90 ? '#fecaca' : pct >= 70 ? '#fde68a' : '#bbf7d0'}`,
    padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }),
  centreName: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
  centreCode: {
    fontSize: 10, fontWeight: 700, background: '#e2e8f0', color: '#475569',
    padding: '2px 7px', borderRadius: 4, display: 'inline-block', marginTop: 2,
  },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: '10px 14px' },
  statBox: (color, bg) => ({ background: bg, borderRadius: 7, padding: '7px 10px', border: `1px solid ${color}22` }),
  statLabel: (color) => ({ fontSize: 9.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }),
  statValue: (color) => ({ fontSize: 15, fontWeight: 800, color, marginTop: 2, lineHeight: 1 }),
  progressWrap: { padding: '0 14px 12px' },
  progressRow:  { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginBottom: 4 },
  progressTrack: { height: 7, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' },
  progressFill: (pct) => ({
    height: '100%', borderRadius: 999, width: `${Math.min(pct, 100)}%`,
    background: pct >= 90 ? '#dc2626' : pct >= 70 ? '#f59e0b' : '#22c55e', transition: 'width .4s',
  }),
  tableHead: { background: 'linear-gradient(90deg,#6d28d9 0%,#4a6fa5 100%)' },
  th: { padding: '9px 12px', color: '#fff', fontWeight: 600, fontSize: 12, textAlign: 'left', whiteSpace: 'nowrap' },
  td: (extra = {}) => ({ padding: '8px 12px', fontSize: 12, ...extra }),
};

const KPI_CONFIG = [
  { key: 'issued',   label: 'Total Issued',     sub: 'across all centres', color: '#2563eb', bg: '#dbeafe', icon: 'bi bi-send-fill'      },
  { key: 'expenses', label: 'Total Expenses',    sub: 'approved expenses',  color: '#dc2626', bg: '#fee2e2', icon: 'bi bi-receipt-cutoff'  },
  { key: 'avail',    label: 'Available Balance', sub: 'current balance',    color: '#15803d', bg: '#dcfce7', icon: 'bi bi-wallet2'         },
  { key: 'pending',  label: 'Pending Approval',  sub: 'awaiting approval',  color: '#d97706', bg: '#fef3c7', icon: 'bi bi-hourglass-split' },
];

const CentreBalance = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage('theme', 'get');

  const [kpiSummary, setKpiSummary]     = useState({ TotalIssued: 0, TotalExpenses: 0, AvailableBalance: 0, PendingApproval: 0 });
  const [centreBalances, setCentreBalances] = useState([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [centreFilter, setCentreFilter] = useState('');

  const loadSummary = () => {
    setIsLoading(true);
    axiosInstance
      .post('Pettycash/GetCentreBalanceSummary', { CentreID: 0 })
      .then((res) => {
        const data = res?.data?.message;
        setKpiSummary(data?.KPISummary || { TotalIssued: 0, TotalExpenses: 0, AvailableBalance: 0, PendingApproval: 0 });
        setCentreBalances(Array.isArray(data?.CentreBalances) ? data.CentreBalances : []);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Failed to load balance summary')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadSummary(); }, []);

  const filtered = centreFilter
    ? centreBalances.filter((b) => String(b.CentreID) === centreFilter)
    : centreBalances;

  const kpiValues = {
    issued:   kpiSummary.TotalIssued,
    expenses: kpiSummary.TotalExpenses,
    avail:    kpiSummary.AvailableBalance,
    pending:  kpiSummary.PendingApproval,
  };

  return (
    <div className={`${theme}`}>

      {/* KPI Summary */}
      <Accordion title="Summary Overview" defaultValue={true} linkTo="#">
        <div style={{ padding: '10px 14px' }}>
          {isLoading ? (
            <div className="text-center py-3"><span className="spinner-border spinner-border-sm" /></div>
          ) : (
            <div style={S.kpiGrid}>
              {KPI_CONFIG.map((cfg) => (
                <div key={cfg.key} style={S.kpiCard(cfg.color)}>
                  <div style={S.kpiIcon(cfg.bg)}>
                    <i className={cfg.icon} style={{ fontSize: 18, color: cfg.color }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={S.kpiAmount(cfg.color)}>{fmt(kpiValues[cfg.key])}</div>
                    <div style={S.kpiLabel}>{t(cfg.label)}</div>
                    <div style={S.kpiSub}>{t(cfg.sub)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Accordion>

      {/* Centre Cards + Table */}
      <Accordion title="Centre-wise Balance" defaultValue={true}>
        <div style={{ padding: '10px 14px' }}>
          <div style={S.centreGrid}>
            {filtered.map((centre) => {
              const availColor = centre.AvailableBalance >= 0 ? '#15803d' : '#dc2626';
              const availBg    = centre.AvailableBalance >= 0 ? '#f0fdf4' : '#fef2f2';
              const pctColor   = centre.UsedPct >= 90 ? '#dc2626' : centre.UsedPct >= 70 ? '#d97706' : '#16a34a';
              return (
                <div key={centre.CentreID} style={S.centreCard}>
                  <div style={S.centreHeader(centre.UsedPct)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', flexShrink: 0 }}>
                        <i className="bi bi-building" style={{ fontSize: 14, color: '#6d28d9' }} />
                      </div>
                      <div>
                        <div style={S.centreName}>{centre.CentreName}</div>
                        <span style={S.centreCode}>{centre.CentreCode}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: pctColor, lineHeight: 1 }}>
                      {centre.UsedPct}%
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#94a3b8', textAlign: 'right' }}>used</div>
                    </div>
                  </div>

                  <div style={S.statGrid}>
                    {[
                      { label: 'Issued',    value: centre.TotalIssued,      color: '#2563eb', bg: '#eff6ff' },
                      { label: 'Expenses',  value: centre.TotalExpenses,    color: '#dc2626', bg: '#fef2f2' },
                      { label: 'Available', value: centre.AvailableBalance, color: availColor, bg: availBg  },
                      { label: 'Pending',   value: centre.PendingApproval,  color: '#d97706', bg: '#fffbeb' },
                    ].map((stat) => (
                      <div key={stat.label} style={S.statBox(stat.color, stat.bg)}>
                        <div style={S.statLabel(stat.color)}>{t(stat.label)}</div>
                        <div style={S.statValue(stat.color)}>{fmt(stat.value)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={S.progressWrap}>
                    <div style={S.progressRow}>
                      <span>{t('Budget Used')}</span>
                      <span style={{ fontWeight: 700, color: pctColor }}>{centre.UsedPct}%</span>
                    </div>
                    <div style={S.progressTrack}>
                      <div style={S.progressFill(centre.UsedPct)} />
                    </div>
                  </div>
                </div>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <div className="text-center text-muted py-4" style={{ gridColumn: '1/-1', fontSize: 13 }}>
                {t('No centre data found')}
              </div>
            )}
          </div>

          {/* Summary Table */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 8px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{t('Balance Summary')}</span>
            <CustomButton text={t('Export')} icon="excel" variant="success" />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={S.tableHead}>
                  {['#', 'Centre', 'Code', 'Total Issued', 'Total Expenses', 'Pending', 'Available', 'Used %'].map((h) => (
                    <th key={h} style={S.th}>{t(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const avColor  = b.AvailableBalance >= 0 ? '#15803d' : '#dc2626';
                  const pct      = b.UsedPct;
                  const barColor = pct >= 90 ? '#dc2626' : pct >= 70 ? '#f59e0b' : '#22c55e';
                  return (
                    <tr key={b.CentreID} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={S.td({ color: '#64748b' })}>{i + 1}</td>
                      <td style={S.td({ fontWeight: 600, color: '#1e293b' })}>{b.CentreName}</td>
                      <td style={S.td()}><span style={S.centreCode}>{b.CentreCode}</span></td>
                      <td style={S.td({ color: '#2563eb', fontWeight: 700 })}>{fmt(b.TotalIssued)}</td>
                      <td style={S.td({ color: '#dc2626', fontWeight: 700 })}>{fmt(b.TotalExpenses)}</td>
                      <td style={S.td({ color: '#d97706', fontWeight: 600 })}>{fmt(b.PendingApproval)}</td>
                      <td style={S.td({ color: avColor, fontWeight: 700 })}>{fmt(b.AvailableBalance)}</td>
                      <td style={S.td()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ ...S.progressTrack, width: 60 }}>
                            <div style={{ ...S.progressFill(pct), background: barColor }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontWeight: 700 }}>
                  <td colSpan={3} style={S.td({ fontWeight: 700, color: '#1e293b' })}>{t('Total')}</td>
                  <td style={S.td({ color: '#2563eb', fontWeight: 800 })}>{fmt(kpiSummary.TotalIssued)}</td>
                  <td style={S.td({ color: '#dc2626', fontWeight: 800 })}>{fmt(kpiSummary.TotalExpenses)}</td>
                  <td style={S.td({ color: '#d97706', fontWeight: 800 })}>{fmt(kpiSummary.PendingApproval)}</td>
                  <td style={S.td({ color: kpiSummary.AvailableBalance >= 0 ? '#15803d' : '#dc2626', fontWeight: 800 })}>{fmt(kpiSummary.AvailableBalance)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default CentreBalance;
