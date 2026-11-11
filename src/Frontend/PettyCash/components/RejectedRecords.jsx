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

const recordTypeOptions = [
  { label: 'All Types', value: ''        },
  { label: 'Issue',     value: 'Issue'   },
  { label: 'Expense',   value: 'Expense' },
];

const RejectedRecords = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage('theme', 'get');

  const [records,       setRecords]       = useState([]);
  const [summary,       setSummary]       = useState({ TotalRejectedAmount: 0, IssueRejectionCount: 0, ExpenseRejectionCount: 0, TotalRecords: 0 });
  const [centreOptions, setCentreOptions] = useState([]);
  const [isLoading,     setIsLoading]     = useState(false);

  const [centreFilter, setCentreFilter] = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [fromDate,     setFromDate]     = useState(new Date());
  const [toDate,       setToDate]       = useState(new Date());

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

    loadRejected();
  }, []);

  // ── Load rejected records ────────────────────────────────────
  const loadRejected = (centreId = '', recType = '', fd = null, td = null) => {
    setIsLoading(true);
    axiosInstance
      .post('Pettycash/GetRejectedRecords', {
        FromDate:    fd ? moment(fd).format('YYYY-MM-DD') : '',
        ToDate:      td ? moment(td).format('YYYY-MM-DD') : '',
        CentreID:    Number(centreId) || 0,
        RecordType:  recType || '',
      })
      .then((res) => {
        const data = res?.data?.message;
        setRecords(Array.isArray(data?.Records) ? data.Records : []);
        setSummary(data?.Summary || { TotalRejectedAmount: 0, IssueRejectionCount: 0, ExpenseRejectionCount: 0, TotalRecords: 0 });
        setPage(0);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Failed to load rejected records')))
      .finally(() => setIsLoading(false));
  };

  const handleSearch = () => loadRejected(centreFilter, typeFilter, fromDate, toDate);
  const handleClear  = () => {
    setCentreFilter(''); setTypeFilter(''); setFromDate(null); setToDate(null); setPage(0);
    loadRejected('', '', null, null);
  };

  const totalPages = Math.ceil(records.length / RPP);
  const paged      = records.slice(page * RPP, page * RPP + RPP);

  return (
    <div className={`${theme}`}>
      {/* Summary Cards */}
      <Accordion title="Rejection Summary" defaultValue={true} isBreadcrumb={true}>
        <div className="card-body">
          <div className="row g-3">
            {[
              { label: 'Total Rejected',   value: `₹${Number(summary.TotalRejectedAmount || 0).toLocaleString()}`, color: '#dc2626', bg: '#fef2f2', icon: 'ti ti-circle-x'    },
              { label: 'Issue Rejections', value: summary.IssueRejectionCount,   color: '#7c3aed', bg: '#f5f3ff', icon: 'ti ti-send-off'    },
              { label: 'Exp. Rejections',  value: summary.ExpenseRejectionCount, color: '#d97706', bg: '#fffbeb', icon: 'ti ti-receipt-off' },
              { label: 'Total Records',    value: summary.TotalRecords,          color: '#2563eb', bg: '#eff6ff', icon: 'ti ti-list-check'  },
            ].map((card) => (
              <div className="col-md-3 col-6" key={card.label}>
                <div className="pc-bal-card" style={{ background: card.bg, border: `1.5px solid ${card.color}22` }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className={card.icon} style={{ fontSize: 18, color: card.color }} />
                    <span style={{ fontSize: 10.5, color: card.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t(card.label)}</span>
                  </div>
                  <div className="pc-bal-value" style={{ color: card.color }}>{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* Filter */}
      <Accordion title="Filter Rejected Records" defaultValue={true}>
        <div>
          <div className="row align-items-end">
            <DatePicker id="fromDate" name="FromDate" lable="From Date" value={fromDate}
              onChange={(v) => setFromDate(v)} respclass="col-md-2 col-6" dateFormat="dd-M-yy" />
            <DatePicker id="toDate" name="ToDate" lable="To Date" value={toDate}
              onChange={(v) => setToDate(v)} respclass="col-md-2 col-6" dateFormat="dd-M-yy" />
            <ReactSelect id="centreFilter" name="CentreFilter" placeholderName="Centre"
              value={centreFilter} dynamicOptions={allCentreOptions}
              onChange={(_, opt) => setCentreFilter(opt?.value ?? '')}
              respclass="col-md-3 col-6" />
            <ReactSelect id="typeFilter" name="TypeFilter" placeholderName="Record Type"
              value={typeFilter} dynamicOptions={recordTypeOptions}
              onChange={(_, opt) => setTypeFilter(opt?.value ?? '')}
              respclass="col-md-2 col-6" />
            <div className="col-auto pb-2">
              <SearchButton text={t('Search')} onClick={handleSearch} />
              <CancelButton text={t('Clear')} onClick={handleClear} className="ml-1" />
            </div>
          </div>
        </div>
      </Accordion>

      {/* Rejected Records Table */}
      <Accordion title="Rejected Records" defaultValue={true}>
        <div>
          {/* <div className="d-flex justify-content-between align-items-center mb-2">
            <span style={{ fontSize: 12, color: '#4a5f75' }}>
              {t('Showing')} <strong>{records.length}</strong> {t('rejected records')}
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
                  <th>{t('Record Type')}</th>
                  <th>{t('Centre')}</th>
                  <th>{t('Code')}</th>
                  <th>{t('Amount')}</th>
                  <th>{t('Date')}</th>
                  <th>{t('Created By')}</th>
                  <th>{t('Txn Type')}</th>
                  <th>{t('Mode')}</th>
                  <th>{t('Invoice No')}</th>
                  <th>{t('Bank')}</th>
                  <th>{t('Card No')}</th>
                  <th>{t('Rejected By')}</th>
                  <th>{t('Rejected Date')}</th>
                  <th>{t('Reject Reason')}</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={row.RejectedRecordID}>
                    <td style={{ fontSize: 11 }}>{page * RPP + i + 1}</td>
                    <td>
                      <span className={`pc-badge ${row.RecordType === 'Issue' ? 'pc-type-transfer' : 'pc-type-expense'}`}>
                        {t(row.RecordType)}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{row.CentreName}</td>
                    <td><span className="pc-code-chip">{row.CentreCode}</span></td>
                    <td className="pc-amount-debit">₹{Number(row.Amount).toLocaleString()}</td>
                    <td style={{ fontSize: 11 }}>{row.Date}</td>
                    <td style={{ fontSize: 11 }}>{row.CreatedBy}</td>
                    <td>
                      <span className={`pc-badge ${row.TxnType === 'Transfer' ? 'pc-type-transfer' : 'pc-type-expense'}`}>
                        {t(row.TxnType)}
                      </span>
                    </td>
                    <td style={{ fontSize: 11 }}>{row.PaymentMode}</td>
                    <td style={{ fontSize: 11 }}>{row.InvoiceNo || '—'}</td>
                    <td style={{ fontSize: 11 }}>{row.Bank || '—'}</td>
                    <td style={{ fontSize: 11 }}>{row.CardNo || '—'}</td>
                    <td style={{ fontSize: 11 }}>{row.RejectedBy}</td>
                    <td style={{ fontSize: 11 }}>{row.RejectedDate}</td>
                    <td>
                      <span className="pc-badge pc-rejected" style={{ fontSize: 10.5 }}>{row.RejectReason}</span>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={15} className="text-center text-muted py-3">{t('No rejected records found')}</td>
                  </tr>
                )}
              </tbody>
            </Tables>
          )}

          <div className="pc-pagination">
            <span>{t('Showing')} {page * RPP + 1}–{Math.min((page + 1) * RPP, records.length)} {t('of')} {records.length}</span>
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

export default RejectedRecords;
