import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Accordion from '@components/UI/Accordion';
import Tables from '@components/UI/customTable';
import ReactSelect from '@components/formComponent/ReactSelect';
import DatePicker from '@components/formComponent/DatePicker';
import { SearchButton, CancelButton, CustomButton } from '@components/UI/CustomButton';
import { useLocalStorage } from '@app/utils/hooks/useLocalStorage';
import { axiosInstance } from '@app/utils/axiosInstance';
import moment from 'moment';
import '../PettyCash.css';

const txnTypeOptions = [
  { label: 'All Types', value: ''         },
  { label: 'Transfer',  value: 'Transfer' },
  { label: 'Expense',   value: 'Expense'  },
];

const Ledger = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage('theme', 'get');

  const [entries,       setEntries]       = useState([]);
  const [summary,       setSummary]       = useState({ TotalCredits: 0, TotalDebits: 0, NetBalance: 0, TotalEntries: 0 });
  const [centreOptions, setCentreOptions] = useState([]);
  const [isLoading,     setIsLoading]     = useState(false);

  const [centreFilter,  setCentreFilter]  = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState('');
  const [fromDate,      setFromDate]      = useState(new Date());
  const [toDate,        setToDate]        = useState(new Date());

  const [page, setPage] = useState(0);
  const RPP = 10;

  const allCentreOptions = [{ label: 'All Centres', value: '' }, ...centreOptions];

  // ── Load centres on mount ────────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get('Centre/getAccessCentres')
      .then((res) => {
        const list = (res?.data?.message || []).map((c) => ({
          label: c.Centre,
          value: String(c.CentreID),
        }));
        setCentreOptions(list);
      })
      .catch(() => {});

    loadEntries();
  }, []);

  // ── Load ledger entries ──────────────────────────────────────
  const loadEntries = (centreId = '', txnType = '', fd = null, td = null) => {
    setIsLoading(true);
    axiosInstance
      .post('Pettycash/GetLedgerEntries', {
        FromDate:  fd  ? moment(fd).format('YYYY-MM-DD')  : new Date(),
        ToDate:    td  ? moment(td).format('YYYY-MM-DD')  : new Date(),
        CentreID:  Number(centreId) || 0,
        TxnType:   txnType || '',
      })
      .then((res) => {
        const data = res?.data?.message;
        const list = data?.entries ?? data?.Entries;
        setEntries(Array.isArray(list) ? list : []);
        const s = data?.summary ?? data?.Summary ?? {};
        setSummary({
          TotalCredits:  s.totalCredits  ?? s.TotalCredits  ?? 0,
          TotalDebits:   s.totalDebits   ?? s.TotalDebits   ?? 0,
          NetBalance:    s.netBalance    ?? s.NetBalance    ?? 0,
          TotalEntries:  s.totalEntries  ?? s.TotalEntries  ?? 0,
        });
        setPage(0);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Failed to load ledger')))
      .finally(() => setIsLoading(false));
  };

  const handleSearch = () => loadEntries(centreFilter, txnTypeFilter, fromDate, toDate);
  const handleClear  = () => {
    setCentreFilter(''); setTxnTypeFilter(''); setFromDate(null); setToDate(null); setPage(0);
    loadEntries('', '', null, null);
  };

  const totalPages = Math.ceil(entries.length / RPP);
  const paged      = entries.slice(page * RPP, page * RPP + RPP);

  return (
    <div className={`${theme}`}>
      {/* Summary Cards */}
      <Accordion title="Ledger Summary" defaultValue={true} isBreadcrumb={true}>
        <div className="card-body">
          <div className="row g-3">
            {[
              { label: 'Total Credits',  value: summary.TotalCredits,  color: '#15803d', bg: '#f0fdf4', icon: 'ti ti-arrow-down-circle', isAmount: true },
              { label: 'Total Debits',   value: summary.TotalDebits,   color: '#dc2626', bg: '#fef2f2', icon: 'ti ti-arrow-up-circle',   isAmount: true },
              { label: 'Net Balance',    value: summary.NetBalance,    color: summary.NetBalance >= 0 ? '#15803d' : '#dc2626', bg: summary.NetBalance >= 0 ? '#f0fdf4' : '#fef2f2', icon: 'ti ti-wallet', isAmount: true },
              { label: 'Transactions',   value: summary.TotalEntries,  color: '#2563eb', bg: '#eff6ff', icon: 'ti ti-list', isAmount: false },
            ].map((card) => (
              <div className="col-md-3 col-6" key={card.label}>
                <div className="pc-bal-card" style={{ background: card.bg, border: `1.5px solid ${card.color}22` }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className={card.icon} style={{ fontSize: 18, color: card.color }} />
                    <span style={{ fontSize: 10.5, color: card.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t(card.label)}</span>
                  </div>
                  <div className="pc-bal-value" style={{ color: card.color }}>
                    {card.isAmount ? `₹${Number(card.value || 0).toLocaleString()}` : card.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* Filter */}
      <Accordion title="Ledger Filter" defaultValue={true}>
        <div >
          <div className="row align-items-end">
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <DatePicker id="fromDate" name="FromDate" lable="From Date" value={fromDate}
                onChange={(v) => setFromDate(v)}  dateFormat="dd-M-yy" className="custom-calendar" />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <DatePicker id="toDate" name="ToDate" lable="To Date" value={toDate}
                onChange={(v) => setToDate(v)}  dateFormat="dd-M-yy" className="custom-calendar" />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect id="centreFilter" name="CentreFilter" placeholderName="Centre"
              value={centreFilter} dynamicOptions={allCentreOptions}
              onChange={(_, opt) => setCentreFilter(opt?.value ?? '')}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <ReactSelect id="txnFilter" name="TxnType" placeholderName="Transaction Type"
                value={txnTypeFilter} dynamicOptions={txnTypeOptions}
                onChange={(_, opt) => setTxnTypeFilter(opt?.value ?? '')}
                />
            </div>
            <div className="col-auto pb-2 d-flex flex-wrap gap-2 align-items-end">
              <SearchButton text={t('Search')} onClick={handleSearch} />
              <CancelButton text={t('Clear')} onClick={handleClear} className="ml-2" />
            </div>
          </div>
        </div>
      </Accordion>

      {/* Ledger Table */}
      <Accordion title="Ledger Entries" defaultValue={true}>
        <div>
          {/* <div className="d-flex justify-content-between align-items-center mb-2">
            <span style={{ fontSize: 12, color: '#4a5f75' }}>
              {t('Showing')} <strong>{entries.length}</strong> {t('entries')}
            </span>
            <CustomButton text={t('Export')} icon="excel" variant="success" />
          </div> */}

          {isLoading ? (
            <div className="text-center py-4"><span className="spinner-border spinner-border-sm" /></div>
          ) : (
            <Tables>
              <thead>
                <tr>
                  <th>{t('SR')}</th>
                  <th>{t('Centre')}</th>
                  <th>{t('Code')}</th>
                  <th>{t('Date')}</th>
                  <th>{t('Transaction Type')}</th>
                  <th>{t('Description')}</th>
                  <th style={{ textAlign: 'right' }}>{t('Credit (₹)')}</th>
                  <th style={{ textAlign: 'right' }}>{t('Debit (₹)')}</th>
                  <th style={{ textAlign: 'right' }}>{t('Balance (₹)')}</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={row.LedgerEntryID} className={row.TxnType === 'Transfer' ? 'pc-txn-transfer' : 'pc-txn-expense'}>
                    <td style={{ fontSize: 11 }} data-title={t('SR')}>{page * RPP + i + 1}</td>
                    <td style={{ fontSize: 12, fontWeight: 600 }} data-title={t('Centre')}>{row.CentreName}</td>
                    <td data-title={t('Code')}><span className="pc-code-chip">{row.CentreCode}</span></td>
                    <td style={{ fontSize: 11 }} data-title={t('Date')}>{row.Date}</td>
                    <td data-title={t('Transaction Type')}>
                      <span className={`pc-badge ${row.TxnType === 'Transfer' ? 'pc-type-transfer' : 'pc-type-expense'}`}>
                        {t(row.TxnType)}
                      </span>
                    </td>
                    <td style={{ fontSize: 11 }} data-title={t('Description')}>{row.Description}</td>
                    <td style={{ textAlign: 'right' }} className={row.AmountReceived > 0 ? 'pc-amount-credit' : ''} data-title={t('Credit (₹)')}>
                      {row.AmountReceived > 0 ? `₹${Number(row.AmountReceived).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }} className={row.AmountPaid > 0 ? 'pc-amount-debit' : ''} data-title={t('Debit (₹)')}>
                      {row.AmountPaid > 0 ? `₹${Number(row.AmountPaid).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: row.RunningBalance >= 0 ? '#15803d' : '#dc2626' }} data-title={t('Balance (₹)')}>
                      ₹{Number(row.RunningBalance).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-muted py-3">{t('No records found')}</td></tr>
                )}
                {paged.length > 0 && (
                  <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                    <td colSpan={6} className="pc-page-total-label" style={{ fontSize: 11, fontWeight: 700 }} data-title="">{t('Page Total')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }} data-title={t('Credit (₹)')}>
                      ₹{paged.reduce((s, r) => s + (r.AmountReceived || 0), 0).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }} data-title={t('Debit (₹)')}>
                      ₹{paged.reduce((s, r) => s + (r.AmountPaid || 0), 0).toLocaleString()}
                    </td>
                    <td className="d-none d-md-table-cell" data-title={t('Balance (₹)')} />
                  </tr>
                )}
              </tbody>
            </Tables>
          )}

          <div className="pc-pagination">
            <span>{t('Showing')} {page * RPP + 1}–{Math.min((page + 1) * RPP, entries.length)} {t('of')} {entries.length}</span>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹ {t('Prev')}</button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>{t('Next')} ›</button>
            </div>
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default Ledger;
