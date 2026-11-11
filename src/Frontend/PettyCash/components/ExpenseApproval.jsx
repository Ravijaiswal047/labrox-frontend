import React, { useState, useEffect } from 'react';
import UploadFile from '../../utils/UploadFileModal/UploadFile';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Accordion from '@components/UI/Accordion';
import Tables from '@components/UI/customTable';
import Input from '@components/formComponent/Input';
import ReactSelect from '@components/formComponent/ReactSelect';
import DatePicker from '@components/formComponent/DatePicker';
import TextAreaInput from '@components/formComponent/TextAreaInput';
import Modal from '@components/formComponent/Modal';
import { SaveButton, CancelButton, SearchButton, CustomButton } from '@components/UI/CustomButton';
import { useLocalStorage } from '@app/utils/hooks/useLocalStorage';
import { getTrimmedData } from '@app/utils/helpers';
import { axiosInstance } from '@app/utils/axiosInstance';
import moment from 'moment';
import '../PettyCash.css';

const PAYMENT_MODES = ['Cash', 'NEFT', 'RTGS', 'Cheque', 'UPI', 'Card'];

const INITIAL_FILTER = { FromDate: new Date(), ToDate: new Date(), CentreID: '', ExpenseTypeID: '', SearchText: '' };
const INITIAL_FORM = {
  CentreID: '', ExpenseTypeID: '', PaymentMode: '', Date: new Date(),
  Amount: '', InvoiceNo: '', InvoiceDate: new Date(), Bank: '', CardNo: '', Narration: '',
};

const paymentOptions = PAYMENT_MODES.map((m) => ({ label: m, value: m }));

const StatusBadge = ({ status }) => {
  const cls = { Approved: 'pc-badge pc-approved', Pending: 'pc-badge pc-pending', Rejected: 'pc-badge pc-rejected' }[status] || 'pc-badge pc-inactive';
  return <span className={cls}>{status}</span>;
};

const ExpenseApproval = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage('theme', 'get');

  const AccessRight = useLocalStorage("accessRight", "get") || "";

  const hasAccessRight38 = AccessRight.split(",").includes("38");

  console.log('AccessRight', AccessRight);
  const [rows, setRows] = useState([]);
  const [centreOptions, setCentreOptions] = useState([]);
  const [expTypeOptions, setExpTypeOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [selected, setSelected] = useState([]);

  const [showNewDlg, setShowNewDlg] = useState(false);
  const [showRejectDlg, setShowRejectDlg] = useState(false);
  const [showReceiptDlg, setShowReceiptDlg] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptLoadingId, setReceiptLoadingId] = useState(null);
  const [receiptImgFailed, setReceiptImgFailed] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');
  const [rejectIds, setRejectIds] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [centreBalance, setCentreBalance] = useState(null);
  const [showUploadDlg, setShowUploadDlg] = useState(false);
  const [receiptGuid, setReceiptGuid] = useState('');

  const [page, setPage] = useState(0);
  const RPP = 10;

  const allCentreOptions = [{ label: 'All Centres', value: '' }, ...centreOptions];
  const allExpTypeOptions = [{ label: 'All Types', value: '' }, ...expTypeOptions];

  // ── Load dropdowns on mount ──────────────────────────────────
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
      .catch(() => { });

    axiosInstance
      .get('Pettycash/GetExpenseTypeDropdown')
      .then((res) => {
        const list = (res?.data?.message || []).map((e) => ({ label: e.label, value: String(e.value) }));
        setExpTypeOptions(list);
      })
      .catch(() => { });

    loadExpenses(INITIAL_FILTER);
  }, []);

  // ── Load expenses ────────────────────────────────────────────
  const loadExpenses = (f = filter) => {
    setIsLoading(true);
    setSelected([]);
    axiosInstance
      .post('Pettycash/GetExpenses', {
        FromDate: moment(f.FromDate).format('YYYY-MM-DD'),
        ToDate: moment(f.ToDate).format('YYYY-MM-DD'),
        CentreID: Number(f.CentreID) || 0,
        ExpenseTypeID: Number(f.ExpenseTypeID) || 0,
        Status: '',
        SearchText: f.SearchText || '',
        PageNo: 1,
        PageSize: 1000,
      })
      .then((res) => {
        const data = res?.data?.message;
        const list = data?.expenses ?? data?.Expenses;
        setRows(Array.isArray(list) ? list : []);
        setPage(0);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Failed to load expenses')))
      .finally(() => setIsLoading(false));
  };

  // ── Filter handlers ──────────────────────────────────────────
  const handleFilterDate = (value, name) => setFilter((prev) => ({ ...prev, [name]: value }));
  const handleFilterSelect = (name, option) => setFilter((prev) => ({ ...prev, [name]: option?.value ?? '' }));
  const handleFilterChange = (e) => setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSearch = () => loadExpenses(filter);
  const handleClear = () => { setFilter(INITIAL_FILTER); loadExpenses(INITIAL_FILTER); };

  // ── Checkboxes ───────────────────────────────────────────────
  const paged = rows.slice(page * RPP, page * RPP + RPP);
  const totalPages = Math.ceil(rows.length / RPP);
  const toggleOne = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(paged.length > 0 && paged.every((r) => selected.includes(r.ExpenseID)) ? [] : paged.map((r) => r.ExpenseID));
  const allChecked = paged.length > 0 && paged.every((r) => selected.includes(r.ExpenseID));

  // ── Approve ──────────────────────────────────────────────────
  const handleAccept = () => {
    if (!selected.length) { toast.warning(t('Select at least one record to accept')); return; }
    setIsSaving(true);
    axiosInstance
      .post('Pettycash/ApproveExpenses', { ExpenseIDs: selected })
      .then((res) => {
        toast.success(res?.data?.message || t('Expenses approved'));
        loadExpenses(filter);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Approve failed')))
      .finally(() => setIsSaving(false));
  };

  // ── Reject ───────────────────────────────────────────────────
  const openReject = () => {
    if (!selected.length) { toast.warning(t('Select at least one record to reject')); return; }
    setRejectIds([...selected]);
    setRejectRemark('');
    setShowRejectDlg(true);
  };

  const handleConfirmReject = () => {
    if (!rejectRemark.trim()) { toast.warning(t('Reject remark is required')); return; }
    setIsSaving(true);
    axiosInstance
      .post('Pettycash/RejectExpenses', { ExpenseIDs: rejectIds, RejectRemark: rejectRemark })
      .then((res) => {
        toast.error(res?.data?.message || t('Selected expenses rejected'));
        setShowRejectDlg(false);
        loadExpenses(filter);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Reject failed')))
      .finally(() => setIsSaving(false));
  };

  // ── New expense ──────────────────────────────────────────────
  const handleFormChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFormSelect = (name, option) => {
    setForm((prev) => ({ ...prev, [name]: option?.value ?? '' }));
    if (name === 'CentreID' && option?.value) {
      axiosInstance
        .get(`Pettycash/GetPettyCashBalance?CentreID=${option.value}`)
        .then((res) => setCentreBalance(res?.data?.message || null))
        .catch(() => setCentreBalance(null));
    } else if (name === 'CentreID') {
      setCentreBalance(null);
    }
  };
  const handleFormDate = (value, name) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleNew = () => {
    const data = getTrimmedData(form);
    if (!data.CentreID || !data.ExpenseTypeID || !data.PaymentMode || !data.Amount || +data.Amount <= 0) {
      toast.warning(t('Please fill all required fields'));
      return;
    }
    setIsSaving(true);
    axiosInstance
      .post('Pettycash/CreateExpense', {
        CentreID: Number(data.CentreID),
        ExpenseTypeID: Number(data.ExpenseTypeID),
        PaymentMode: data.PaymentMode,
        Date: moment(data.Date).format('YYYY-MM-DD'),
        Amount: Number(data.Amount),
        InvoiceNo: data.InvoiceNo || '',
        InvoiceDate: data.InvoiceDate ? moment(data.InvoiceDate).format('YYYY-MM-DD') : '',
        Bank: data.Bank || '',
        CardNo: data.CardNo || '',
        Narration: data.Narration || '',
        ReceiptGuid: receiptGuid || '',
      })
      .then((res) => {
        toast.success(res?.data?.message?.Message || t('Expense submitted for approval'));
        setShowNewDlg(false);
        setForm(INITIAL_FORM);
        setCentreBalance(null);
        loadExpenses(filter);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Submit failed')))
      .finally(() => setIsSaving(false));
  };

  // ── View receipt ─────────────────────────────────────────────
  const handleViewReceipt = async (uniqueKey) => {
    setReceiptLoadingId(uniqueKey);
    try {
      const urlRes = await axiosInstance.post('CommonController/GetFileUrl', { Key: uniqueKey });
      if (!urlRes?.data?.success) {
        toast.warning(t('No receipt uploaded for this record'));
        return;
      }
      setReceiptUrl(urlRes.data.message);
      setReceiptImgFailed(false);
      setShowReceiptDlg(true);
    } catch {
      toast.error(t('Could not load receipt'));
    } finally {
      setReceiptLoadingId(null);
    }
  };
  // console.log('accessRight', accessRight);

  return (
    <div className={`${theme}`}>
      {/* Filter */}
      <Accordion title="Search Expenses" defaultValue={true}>
        <div>
          <div className="row align-items-end">
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <DatePicker id="fromDate" name="FromDate" lable="From Date" value={filter.FromDate} className="custom-calendar"
                onChange={handleFilterDate} dateFormat="dd-M-yy" />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <DatePicker id="toDate" name="ToDate" lable="To Date" value={filter.ToDate} className="custom-calendar"
                onChange={handleFilterDate} dateFormat="dd-M-yy" />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <ReactSelect id="centreFilter" name="CentreID" placeholderName="Centre"
                value={filter.CentreID} dynamicOptions={allCentreOptions}
                onChange={handleFilterSelect} />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect id="expTypeFilter" name="ExpenseTypeID" placeholderName="Expense Type"
              value={filter.ExpenseTypeID} dynamicOptions={allExpTypeOptions}
              onChange={handleFilterSelect} />
              </div>
            {/* <Input type="text" name="SearchText" id="searchText" lable="Search Centre / Invoice"
              value={filter.SearchText} onChange={handleFilterChange} respclass="col-md-2 col-6" /> */}
            <div className="col-auto pb-2 d-flex flex-wrap gap-2 align-items-end">
              <SearchButton text={t('Search')} onClick={handleSearch} />
              {/* <CancelButton text={t('Clear')} onClick={handleClear} className="ml-2" /> */}
              {/* <CustomButton text={t('Export')} icon="excel" variant="success" className="ml-2" /> */}
              <SaveButton text={t('New Expense')} onClick={() => { setShowNewDlg(true); setReceiptGuid(Date.now().toString(36) + Math.random().toString(36).slice(2)); }} className="ml-2" />
              {hasAccessRight38 && selected.length > 0 && (
                <button className="btn btn-sm btn-success ml-2" style={{ fontSize: 12 }} onClick={handleAccept} disabled={isSaving || isLoading}>
                  <i className="ti ti-circle-check me-1" />{t('Approve')}
                </button>
              )}
              {hasAccessRight38 && selected.length > 0 && (
                <button className="btn btn-sm btn-danger ml-2" style={{ fontSize: 12 }} onClick={openReject} disabled={isSaving || isLoading}>
                  <i className="ti ti-circle-x me-1" />{t('Reject')}
                </button>
              )}
            </div>
          </div>

        </div>
      </Accordion>

      {/* Table */}
      {paged.length > 0 && (
        <Accordion title="Expense Records" defaultValue={true}>
          <div >


            {isLoading ? (
              <div className="text-center py-4"><span className="spinner-border spinner-border-sm" /></div>
            ) : (
              <Tables>
                <thead>
                  <tr>
                    {hasAccessRight38 && (
                      <th className="pc-check-col">
                        <input type="checkbox" className="pc-checkbox" checked={allChecked} onChange={toggleAll} />
                      </th>
                    )}
                    <th>{t('SR')}</th>
                    <th>{t('Centre')}</th>
                    <th>{t('Code')}</th>
                    <th>{t('Amount')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('Created By')}</th>
                    <th>{t('Exp. Type')}</th>
                    <th>{t('Mode')}</th>
                    <th>{t('Invoice No')}</th>
                    <th>{t('Inv. Date')}</th>
                    <th>{t('Bank')}</th>
                    <th>{t('Card No')}</th>
                    <th>{t('Approved By')}</th>
                    <th>{t('App. Date')}</th>
                    <th>{t('Receipt')}</th>
                    <th>{t('Narration')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row, i) => (
                    <tr key={row.ExpenseID} style={{ background: selected.includes(row.ExpenseID) ? '#f0f5ff' : undefined }}>
                      {hasAccessRight38 && (
                        <td className="pc-check-col" data-title={t('Select')}>
                          {row.Status === 'Pending' && (
                            <input type="checkbox" className="pc-checkbox"
                              checked={selected.includes(row.ExpenseID)}
                              onChange={() => toggleOne(row.ExpenseID)} />
                          )}
                        </td>
                      )}
                      <td style={{ fontSize: 11 }} data-title={t('SR')}>{page * RPP + i + 1}</td>
                      <td style={{ fontSize: 12, fontWeight: 600 }} data-title={t('Centre')}>{row.CentreName}</td>
                      <td data-title={t('Code')}><span className="pc-code-chip">{row.CentreCode}</span></td>
                      <td className="pc-amount" data-title={t('Amount')}>₹{Number(row.Amount).toLocaleString()}</td>
                      <td style={{ fontSize: 11 }} data-title={t('Date')}>{row.Date}</td>
                      <td style={{ fontSize: 11 }} data-title={t('Created By')}>{row.CreatedBy}</td>
                      <td data-title={t('Exp. Type')}>
                        <span className="pc-badge pc-type-expense" style={{ fontSize: 10.5 }}>{row.ExpenseTypeName}</span>
                      </td>
                      <td style={{ fontSize: 11 }} data-title={t('Mode')}>{row.PaymentMode}</td>
                      <td style={{ fontSize: 11 }} data-title={t('Invoice No')}>{row.InvoiceNo || '—'}</td>
                      <td style={{ fontSize: 11 }} data-title={t('Inv. Date')}>{row.InvoiceDate || '—'}</td>
                      <td style={{ fontSize: 11 }} data-title={t('Bank')}>{row.Bank || '—'}</td>
                      <td style={{ fontSize: 11 }} data-title={t('Card No')}>{row.CardNo || '—'}</td>
                      <td style={{ fontSize: 11 }} data-title={t('Approved By')}>{row.ApprovedBy || '—'}</td>
                      <td style={{ fontSize: 11 }} data-title={t('App. Date')}>{row.ApprovedDate || '—'}</td>
                      <td data-title={t('Receipt')}>
                        {row.UniqueKey
                          ? (
                            <button className="btn btn-sm btn-link p-0" style={{ fontSize: 15, lineHeight: 1 }}
                              onClick={() => handleViewReceipt(row.UniqueKey)}
                              disabled={receiptLoadingId === row.UniqueKey}
                            >
                              {receiptLoadingId === row.UniqueKey
                                ? <span className="spinner-border spinner-border-sm" />
                                : <i className="ti ti-zoom-in" />
                              }
                            </button>
                          )
                          : <span style={{ fontSize: 11, color: '#94a3b8' }}>—</span>
                        }
                      </td>
                      <td style={{ fontSize: 11, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} data-title={t('Narration')}>
                        {row.Narration}
                      </td>
                      <td data-title={t('Status')}><StatusBadge status={row.Status} /></td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr><td colSpan={18} className="text-center text-muted py-3">{t('No records found')}</td></tr>
                  )}
                </tbody>
              </Tables>
            )}

            <div className="pc-pagination">
              <span>{t('Showing')} {page * RPP + 1}–{Math.min((page + 1) * RPP, rows.length)} {t('of')} {rows.length}</span>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹ {t('Prev')}</button>
                <button className="btn btn-sm btn-outline-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>{t('Next')} ›</button>
              </div>
            </div>
          </div>
        </Accordion>)}

      {/* New Expense Modal */}
      <Modal visible={showNewDlg} setVisible={setShowNewDlg}
        Header={
          <div className="d-flex align-items-center justify-content-between w-100">
            <span>{t('New Expense Entry')}</span>
            {centreBalance && (
              <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.85)', marginRight: 28 }}>
                {t('Issued')}: ₹{Number(centreBalance.TotalIssued ?? 0).toLocaleString()}
                <span style={{ margin: '0 6px' }}>|</span>
                {t('Expenses')}: ₹{Number(centreBalance.TotalExpenses ?? 0).toLocaleString()}
                <span style={{ margin: '0 6px' }}>|</span>
                {t('Pending')}: ₹{Number(centreBalance.PendingApproval ?? 0).toLocaleString()}
                <span style={{ margin: '0 6px' }}>|</span>
                {t('Available')}: ₹{Number(centreBalance.AvailableBalance ?? 0).toLocaleString()}
              </span>
            )}
          </div>
        }
        modalWidth="580px"
        buttons={<>
          <SaveButton text={t('Submit')} onClick={handleNew} disabled={isSaving} />
          <CancelButton text={t('Cancel')} onClick={() => { setShowNewDlg(false); setCentreBalance(null); }} />
        </>}
      >
        <div className="row">
          <ReactSelect id="newCentre" name="CentreID" placeholderName="Centre *"
            value={form.CentreID} dynamicOptions={centreOptions}
            onChange={handleFormSelect} respclass="col-md-6 col-12" />
          <ReactSelect id="newExpType" name="ExpenseTypeID" placeholderName="Expense Type *"
            value={form.ExpenseTypeID} dynamicOptions={expTypeOptions}
            onChange={handleFormSelect} respclass="col-md-6 col-12" />
          <ReactSelect id="newPayMode" name="PaymentMode" placeholderName="Payment Mode *"
            value={form.PaymentMode} dynamicOptions={paymentOptions}
            onChange={handleFormSelect} respclass="col-md-6 col-12" />
          <DatePicker id="newDate" name="Date" lable="Date" value={form.Date}
            onChange={handleFormDate} respclass="col-md-6 col-6" dateFormat="dd-M-yy" />
          <Input type="number" name="Amount" id="newAmount" lable="Amount (₹) *"
            value={form.Amount} onChange={handleFormChange} respclass="col-md-6 col-6" display="right" />
          <Input type="text" name="InvoiceNo" id="invoiceNo" lable="Invoice No"
            value={form.InvoiceNo} onChange={handleFormChange} respclass="col-md-6 col-6" />
          <DatePicker id="invoiceDate" name="InvoiceDate" lable="Invoice Date" value={form.InvoiceDate}
            onChange={handleFormDate} respclass="col-md-6 col-6" dateFormat="dd-M-yy" />
          {form.PaymentMode !== 'Cash' && (
            <>
              <Input type="text" name="Bank" id="newBank" lable="Bank"
                value={form.Bank} onChange={handleFormChange} respclass="col-md-6 col-6" />
              <Input type="text" name="CardNo" id="newCardNo" lable="Card No"
                value={form.CardNo} onChange={handleFormChange} respclass="col-md-6 col-6" />
            </>
          )}
          <TextAreaInput name="Narration" id="narration" lable="Narration"
            value={form.Narration} onChange={handleFormChange} respclass="col-12" rows={2} />
          <div className="col-12 mt-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              style={{ fontSize: 12 }}
              onClick={() => setShowUploadDlg(true)}
            >
              <i className="ti ti-paperclip me-1" />{t('Upload Receipt / Document')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Receipt Upload Modal */}
      {receiptGuid && (
        <UploadFile
          show={showUploadDlg}
          handleClose={() => setShowUploadDlg(false)}
          documentId={receiptGuid}
          pageName="PettyCashExpense"
          options={[{ label: 'Receipt', value: 'Receipt' }]}
        />
      )}

      {/* Reject Modal */}
      <Modal visible={showRejectDlg} setVisible={setShowRejectDlg}
        Header={t('Reject Expenses — Enter Remark')} modalWidth="440px"
        buttons={<>
          <button className="btn btn-sm btn-danger" onClick={handleConfirmReject} disabled={isSaving} style={{ fontSize: 12 }}>
            <i className="ti ti-circle-x me-1" />{t('Confirm Reject')}
          </button>
          <CancelButton text={t('Cancel')} onClick={() => setShowRejectDlg(false)} />
        </>}
      >
        <div className="row">
          <TextAreaInput name="RejectRemark" id="rejectRemark" lable="Reject Remark *"
            value={rejectRemark} onChange={(e) => setRejectRemark(e.target.value)}
            respclass="col-12" rows={3} required={true} />
        </div>
      </Modal>

      {/* Receipt Preview Modal */}
      <Modal visible={showReceiptDlg} setVisible={setShowReceiptDlg}
        Header={t('Receipt / Document')} modalWidth="520px"
        buttons={<CancelButton text={t('Close')} onClick={() => { setShowReceiptDlg(false); setReceiptUrl(''); }} />}
      >
        <div className="text-center py-2">
          {receiptUrl && (
            receiptImgFailed
              ? <iframe src={receiptUrl} title="Receipt" style={{ width: '100%', height: 440, border: 'none', borderRadius: 6 }} />
              : <img
                src={receiptUrl}
                alt="Receipt"
                style={{ maxWidth: '100%', maxHeight: 440, borderRadius: 6, border: '1px solid #e2e8f0' }}
                onError={() => setReceiptImgFailed(true)}
              />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ExpenseApproval;
