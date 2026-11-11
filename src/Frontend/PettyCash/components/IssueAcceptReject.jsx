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

const INITIAL_FILTER = { FromDate: new Date(), ToDate: new Date(), CentreID: '', SearchText: '' };
const INITIAL_FORM = { CentreID: '', PaymentMode: '', Date: new Date(), Amount: '', Type: 'Transfer', CardNo: '', Bank: '', Remarks: '' };

const paymentOptions = PAYMENT_MODES.map((m) => ({ label: m, value: m }));
const typeOptions = [{ label: 'Transfer', value: 'Transfer' }, { label: 'Adjustment', value: 'Adjustment' }];

const STATUS_LABEL = { Approved: 'Accept', Pending: 'New', Rejected: 'Reject' };
const StatusBadge = ({ status }) => {
  const cls = { Approved: 'pc-badge pc-approved', Pending: 'pc-badge pc-pending', Rejected: 'pc-badge pc-rejected' }[status] || 'pc-badge pc-inactive';
  return <span className={cls}>{STATUS_LABEL[status] || status}</span>;
};
const TypeBadge = ({ type }) => {
  const cls = type === 'Transfer' ? 'pc-badge pc-type-transfer' : 'pc-badge pc-type-adjustment';
  return <span className={cls}>{type}</span>;
};

const IssueAcceptReject = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage('theme', 'get');
  const userCentreID = String(useLocalStorage('DefaultCentre', 'get') || '');
  const AccessRight = useLocalStorage("accessRight", "get") || "";

  const hasAccessRight39 = AccessRight.split(",").includes("39");

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [centreOptions, setCentreOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [selected, setSelected] = useState([]);

  const [showNewDlg, setShowNewDlg] = useState(false);
  const [showRejectDlg, setShowRejectDlg] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');
  const [rejectIds, setRejectIds] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadDlg, setShowUploadDlg] = useState(false);
  const [receiptGuid, setReceiptGuid] = useState('');
  const [showReceiptDlg, setShowReceiptDlg] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptLoadingId, setReceiptLoadingId] = useState(null);
  const [receiptImgFailed, setReceiptImgFailed] = useState(false);

  const [page, setPage] = useState(0);
  const RPP = 10;

  const allCentreOptions = [{ label: 'All Centres', value: '' }, ...centreOptions];

  // ── Load centres ─────────────────────────────────────────────
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
    loadTransactions(INITIAL_FILTER);
  }, []);

  // ── Load transactions ────────────────────────────────────────
  const loadTransactions = (f = filter) => {
    setIsLoading(true);
    setSelected([]);
    axiosInstance
      .post('Pettycash/GetIssueTransactions', {
        FromDate: moment(f.FromDate).format('YYYY-MM-DD'),
        ToDate: moment(f.ToDate).format('YYYY-MM-DD'),
        CentreID: Number(f.CentreID) || 0,
        Status: '',
        SearchText: f.SearchText || '',
        PageNo: 1,
        PageSize: 1000,
      })
      .then((res) => {
        const data = res?.data?.message;
        setRows(Array.isArray(data?.transactions) ? data.transactions : []);
        setTotalCount(data?.totalCount || 0);
        setPage(0);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Failed to load transactions')))
      .finally(() => setIsLoading(false));
  };

  // ── Filter handlers ──────────────────────────────────────────
  const handleFilterDate = (value, name) => setFilter((prev) => ({ ...prev, [name]: value }));
  const handleFilterSelect = (name, option) => setFilter((prev) => ({ ...prev, [name]: option?.value ?? '' }));
  const handleFilterChange = (e) => setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSearch = () => loadTransactions(filter);
  const handleClear = () => { setFilter(INITIAL_FILTER); loadTransactions(INITIAL_FILTER); };

  // ── Checkbox logic ───────────────────────────────────────────
  const paged = rows.slice(page * RPP, page * RPP + RPP);
  const totalPages = Math.ceil(rows.length / RPP);

  // Row is actionable only if it is pending AND belongs to the logged-in user's centre
  const canAct = (r) =>
    (r.STATUS || '').trim().toLowerCase() === 'pending' &&
    String(r.CentreID) === userCentreID;

  const actionableRows = paged.filter(canAct);
  const toggleOne = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(
    actionableRows.length > 0 && actionableRows.every((r) => selected.includes(r.IssueTransactionID))
      ? []
      : actionableRows.map((r) => r.IssueTransactionID)
  );
  const allChecked = actionableRows.length > 0 && actionableRows.every((r) => selected.includes(r.IssueTransactionID));

  // ── Approve ──────────────────────────────────────────────────
  const handleAccept = () => {
    if (!selected.length) { toast.warning(t('Select at least one record to accept')); return; }
    setIsSaving(true);
    axiosInstance
      .post('Pettycash/ApproveIssueTransactions', { IssueTransactionIDs: selected })
      .then((res) => {
        toast.success(res?.data?.message || t('Selected transfers accepted'));
        loadTransactions(filter);
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
      .post('Pettycash/RejectIssueTransactions', { IssueTransactionIDs: rejectIds, RejectRemark: rejectRemark })
      .then((res) => {
        toast.error(res?.data?.message || t('Selected transfers rejected'));
        setShowRejectDlg(false);
        loadTransactions(filter);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Reject failed')))
      .finally(() => setIsSaving(false));
  };

  // ── New transfer ─────────────────────────────────────────────
  const handleFormChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFormSelect = (name, option) => setForm((prev) => ({ ...prev, [name]: option?.value ?? '' }));
  const handleFormDate = (value, name) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleNew = () => {
    const data = getTrimmedData(form);
    if (!data.CentreID || !data.PaymentMode || !data.Amount || +data.Amount <= 0) {
      toast.warning(t('Please fill all required fields'));
      return;
    }
    setIsSaving(true);
    axiosInstance
      .post('Pettycash/CreateIssueTransaction', {
        CentreID: Number(data.CentreID),
        Type: data.Type || 'Transfer',
        PaymentMode: data.PaymentMode,
        Date: moment(data.Date).format('YYYY-MM-DD'),
        Amount: Number(data.Amount),
        Bank: data.Bank || '',
        CardNo: data.CardNo || '',
        Remarks: data.Remarks || '',
        guid: receiptGuid || '',
      })
      .then((res) => {
        toast.success(res?.data?.message?.Message || t('Transfer submitted for approval'));
        setShowNewDlg(false);
        setForm(INITIAL_FORM);
        loadTransactions(filter);
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

  return (
    <div className={`${theme}`}>
      {/* Filter */}
      <Accordion title="Search Transfers" defaultValue={true} >
        <div className='mt-2'>
          <div className="row align-items-start">
            <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker id="fromDate" name="FromDate" lable="From Date" value={filter.FromDate} className="custom-calendar"
              onChange={handleFilterDate}  dateFormat="dd-M-yy" />
            </div>
       
              <div  className="col-12 col-sm-6 col-md-2 my-1">
                   <DatePicker id="toDate" name="ToDate" lable="To Date" value={filter.ToDate} className="custom-calendar"
              onChange={handleFilterDate}  dateFormat="dd-M-yy" />
              </div>
           <div className="col-12 col-sm-6 col-md-2 my-1">
             <ReactSelect id="centreFilter" name="CentreID" placeholderName="Centre"
              value={filter.CentreID} dynamicOptions={allCentreOptions}
              onChange={handleFilterSelect}  />
           </div>
           <div className="col-12 col-sm-6 col-md-2 my-1">
              <Input type="text" name="SearchText" id="searchText" lable="Search Centre / Code" className="form-control"
              value={filter.SearchText} onChange={handleFilterChange}  />
           </div>
          

            <div className="col-12 col-sm-6 col-md-auto my-1 d-flex flex-wrap gap-2 align-items-center">
              <SearchButton text={t('Search')} onClick={handleSearch} />
              {/* <CancelButton text={t('Clear')} onClick={handleClear} className="ml-2" /> */}
              {/* <CustomButton text={t('Export')} icon="excel" variant="success" className="ml-2" /> */}
              <SaveButton text={t('New Transfer')} onClick={() => { setShowNewDlg(true); setReceiptGuid(Date.now().toString(36) + Math.random().toString(36).slice(2)); }} className="ml-2" />
                {hasAccessRight39 && selected.length > 0 && (
              <button className="btn btn-sm btn-success ml-2" style={{ fontSize: 12 }} onClick={handleAccept} disabled={isSaving || isLoading}>
                <i className="ti ti-circle-check me-1" />{t('Approve')}
              </button>
              )}
              {hasAccessRight39 && selected.length > 0 && (
              <button className="btn btn-sm btn-danger ml-2" style={{ fontSize: 12 }} onClick={openReject} disabled={isSaving || isLoading}>
                <i className="ti ti-circle-x me-1" />{t('Reject')}
              </button>
              )}
            </div>
          </div>
        </div>
      </Accordion>

      {/* Table */}
      {!isLoading && rows.length === 0 ? null : (
        <Accordion title="Transfer List" defaultValue={true}>
          <div >


            {isLoading ? (
              <div className="text-center py-4"><span className="spinner-border spinner-border-sm" /></div>
            ) : (
              <Tables>
                <thead>
                  <tr>
                    {hasAccessRight39 && (
                      <th className="pc-check-col">
                        <input type="checkbox" style={{ width: 13, height: 13, cursor: 'pointer' }} checked={allChecked} onChange={toggleAll} />
                      </th>
                    )}
                    <th>{t('SR')}</th>
                    <th>{t('Centre Name')}</th>
                    <th>{t('Code')}</th>
                    <th>{t('Amount')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('Created By')}</th>
                    <th>{t('Type')}</th>
                    <th>{t('Mode')}</th>
                    <th>{t('Card No')}</th>
                    <th>{t('Bank')}</th>
                    <th>{t('Approved By')}</th>
                    <th>{t('App. Date')}</th>
                    <th>{t('Reject Remark')}</th>
                    <th>{t('Remark')}</th>
                    <th>{t('Receipt')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row, i) => {
                    const rowCanAct = canAct(row);
                    const isPending = (row.STATUS || '').trim().toLowerCase() === 'pending';
                    const isWrongCentre = isPending && !rowCanAct;
                    return (
                      <tr key={row.IssueTransactionID} style={{ background: selected.includes(row.IssueTransactionID) ? '#f0f5ff' : isWrongCentre ? '#fffbeb' : undefined }}>
                        {hasAccessRight39 && (
                          <td className="pc-check-col" data-title="">
                            <span title={isWrongCentre ? t('This transfer belongs to another centre') : ''}>
                              <input
                                type="checkbox"
                                style={{ accentColor: '#6d28d9', width: 13, height: 13, cursor: rowCanAct ? 'pointer' : 'not-allowed', opacity: rowCanAct ? 1 : 0.3 }}
                                disabled={!rowCanAct}
                                checked={selected.includes(row.IssueTransactionID)}
                                onChange={() => toggleOne(row.IssueTransactionID)}
                              />
                            </span>
                          </td>
                        )}
                        <td data-title="SR" style={{ fontSize: 11 }}>{page * RPP + i + 1}</td>
                        <td data-title="Centre Name" style={{ fontSize: 12, fontWeight: 600 }}>{row.CentreName}</td>
                        <td data-title="Code"><span className="pc-code-chip">{row.CentreCode}</span></td>
                        <td data-title="Amount" className="pc-amount">₹{Number(row.Amount).toLocaleString()}</td>
                        <td data-title="Date" style={{ fontSize: 11 }}>{row.Date}</td>
                        <td data-title="Created By" style={{ fontSize: 11 }}>{row.CreatedBy}</td>
                        <td data-title="Type"><TypeBadge type={row.TYPE} /></td>
                        <td data-title="Mode" style={{ fontSize: 11 }}>{row.PaymentMode}</td>
                        <td data-title="Card No" style={{ fontSize: 11 }}>{row.CardNo || '—'}</td>
                        <td data-title="Bank" style={{ fontSize: 11 }}>{row.Bank || '—'}</td>
                        <td data-title="Approved By" style={{ fontSize: 11 }}>{row.ApprovedBy || '—'}</td>
                        <td data-title="App. Date" style={{ fontSize: 11 }}>{row.ApprovedDate || '—'}</td>
                        <td data-title="Reject Remark" style={{ fontSize: 11, color: '#dc2626' }}>{row.RejectRemark || '—'}</td>
                        <td data-title="Remark" style={{ fontSize: 11 }}>{row.Remarks || '—'}</td>
                        <td data-title="Receipt">
                          {row.UniqueKey
                            ? (
                              <div
                              // onClick={() => handleViewReceipt(row.UniqueKey)}
                              // disabled={receiptLoadingId === row.UniqueKey}
                              >
                                {receiptLoadingId === row.UniqueKey
                                  ? <span className="spinner-border spinner-border-sm" />
                                  : <i
                                    className="fa fa-search"
                                    onClick={() => handleViewReceipt(row.UniqueKey)}
                                    disabled={receiptLoadingId === row.UniqueKey}
                                  />
                                }
                              </div>
                            )
                            : <span style={{ fontSize: 11, color: '#94a3b8' }}>—</span>
                          }
                        </td>
                        <td data-title="Status"><StatusBadge status={row.STATUS} /></td>
                      </tr>
                    );
                  })}
                  {paged.length === 0 && (
                    <tr><td colSpan={17} className="text-center text-muted py-3">{t('No records found')}</td></tr>
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
        </Accordion>
      )}

      {/* New Transfer Modal */}
      <Modal visible={showNewDlg} setVisible={setShowNewDlg}
        Header={t('New Transfer / Issue')} modalWidth="560px"
        buttons={<>
          <SaveButton text={t('Submit')} onClick={handleNew} disabled={isSaving} />
          <CancelButton text={t('Cancel')} onClick={() => setShowNewDlg(false)} />
        </>}
      >
        <div className="row">
          <ReactSelect id="centre" name="CentreID" placeholderName="Centre *"
            value={form.CentreID} dynamicOptions={centreOptions}
            onChange={handleFormSelect} respclass="col-md-6 col-12" />
          <ReactSelect id="type" name="Type" placeholderName="Type"
            value={form.Type} dynamicOptions={typeOptions}
            onChange={handleFormSelect} respclass="col-md-6 col-12" />
          <ReactSelect id="paymentMode" name="PaymentMode" placeholderName="Payment Mode *"
            value={form.PaymentMode} dynamicOptions={paymentOptions}
            onChange={handleFormSelect} respclass="col-md-6 col-12" />
          <DatePicker id="txnDate" name="Date" lable="Date" value={form.Date}
            onChange={handleFormDate} respclass="col-md-6 col-6" dateFormat="dd-M-yy" />
          <Input type="number" name="Amount" id="amount" lable="Amount (₹) *"
            value={form.Amount} onChange={handleFormChange} respclass="col-md-4 col-6" display="right" />
          {form.PaymentMode !== 'Cash' && (
            <>
              <Input type="text" name="Bank" id="bank" lable="Bank"
                value={form.Bank} onChange={handleFormChange} respclass="col-md-6 col-6" />
              <Input type="text" name="CardNo" id="cardNo" lable="Card No"
                value={form.CardNo} onChange={handleFormChange} respclass="col-md-6 col-6" />
            </>
          )}
          <TextAreaInput name="Remarks" id="remarks" lable="Remarks"
            value={form.Remarks} onChange={handleFormChange} respclass="col-12" rows={2} />
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

      {/* Receipt Upload Modal */}
      {receiptGuid && (
        <UploadFile
          show={showUploadDlg}
          handleClose={() => setShowUploadDlg(false)}
          documentId={receiptGuid}
          pageName="PettyCashIssue"
          options={[{ label: 'Receipt', value: 'Receipt' }]}
        />
      )}

      {/* Reject Modal */}
      <Modal visible={showRejectDlg} setVisible={setShowRejectDlg}
        Header={t('Reject Transfers — Enter Remark')} modalWidth="440px"
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
    </div>
  );
};

export default IssueAcceptReject;
