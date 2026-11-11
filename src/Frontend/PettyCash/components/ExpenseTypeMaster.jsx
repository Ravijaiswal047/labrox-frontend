import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Accordion from '@components/UI/Accordion';
import Tables from '@components/UI/customTable';
import Input from '@components/formComponent/Input';
import { SaveButton, CancelButton, EditButton } from '@components/UI/CustomButton';
import { useLocalStorage } from '@app/utils/hooks/useLocalStorage';
import { getTrimmedData } from '@app/utils/helpers';
import { axiosInstance } from '@app/utils/axiosInstance';
import '../PettyCash.css';
import ColorCodingSearch from '@components/ModalComponent/ColorCodingSearch';

const EMPTY_FORM = { expenseTypeName: '', ledgerNo: '', isActive: '1' };

const colorCodingData = [
  { color: '#FFFFFF', id: '1', labelKey: 'Active', filterValue: '1' },
  { color: '#f5c6cb', id: '2', labelKey: 'In Active', filterValue: '0' },
];

const StatusBadge = ({ status }) => {
  const cls = status === 'Active' ? 'pc-badge pc-active' : 'pc-badge pc-inactive';
  return <span className={cls}>{status}</span>;
};

const ExpenseTypeMaster = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage('theme', 'get');

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [page, setPage] = useState(0);
  const [filterActive, setFilterActive] = useState(null);
  const RPP = 10;

  const loadExpenseTypes = () => {
    setIsLoading(true);
    axiosInstance
      .post('Pettycash/GetAllExpenseTypes', { SearchText: '', IsActive: '' })
      .then((res) => {
        const data = res?.data?.message;
        setRows(Array.isArray(data) ? data : []);
        setPage(0);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Failed to load expense types')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadExpenseTypes(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setForm((prev) => ({ ...prev, isActive: prev.isActive === '1' ? '0' : '1' }));
  };

  const openEdit = (row) => {
    setForm({
      expenseTypeName: row.ExpenseTypeName,
      ledgerNo: row.LedgerNo,
      isActive: String(row.IsActive),
    });
    setIsEditMode(true);
    setEditId(row.ExpenseTypeID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    setIsEditMode(false);
    setEditId(null);
  };

  const handleSave = () => {
    const data = getTrimmedData(form);
    if (!data.expenseTypeName || !data.ledgerNo) {
      toast.warning(t('Expense Type Name and Ledger No are required'));
      return;
    }
    setIsSaving(true);
    axiosInstance
      .post('Pettycash/SaveExpenseType', {
        expenseTypeID: isEditMode ? editId : 0,
        expenseTypeName: data.expenseTypeName,
        ledgerNo: data.ledgerNo,
        isActive: data.isActive,
      })
      .then((res) => {
        toast.success(res?.data?.message?.Message || t(isEditMode ? 'Expense Type updated' : 'Expense Type saved'));
        handleClear();
        loadExpenseTypes();
      })
      .catch((err) => toast.error(err?.response?.data?.message || t('Save failed')))
      .finally(() => setIsSaving(false));
  };

  const handleFilterClick = (filterValue) => {
    setFilterActive((prev) => (prev === filterValue ? null : filterValue));
    setPage(0);
  };

  const filteredRows = filterActive === null ? rows : rows.filter((r) => String(r.IsActive) === filterActive);
  const totalPages = Math.ceil(filteredRows.length / RPP);
  const paged = filteredRows.slice(page * RPP, page * RPP + RPP);

  return (
    <div className={`${theme}`}>
      <Accordion title={isEditMode ? t('Edit Expense Type') : t('Expense Type Master')} defaultValue={true}>
        <div className="row align-items-end p-2">
          <Input
            type="text"
            name="expenseTypeName"
            id="expenseTypeName"
            lable={t('Expense Type Name')}
            value={form.expenseTypeName}
            onChange={handleChange}
            respclass="col-md-3 col-sm-6 col-12"
            required={true}
          />
          <Input
            type="text"
            name="ledgerNo"
            id="ledgerNo"
            lable={t('Ledger No')}
            value={form.ledgerNo}
            onChange={handleChange}
            respclass="col-md-2 col-sm-6 col-12"
            required={true}
          />
          <div className="col-auto pb-2 d-flex flex-column">
            {/* <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>
              {t('Is Active')}
            </label> */}
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="isActiveToggle"
                checked={form.isActive === '1'}
                onChange={handleToggle}
              />
              <label className="custom-control-label" htmlFor="isActiveToggle">
                {form.isActive === '1' ? t('Active') : t('In-Active')}
              </label>
            </div>
          </div>
          <div className="col-auto pb-2">
            <SaveButton text={isEditMode ? t('Update') : t('Save')} onClick={handleSave} disabled={isSaving} />
            <CancelButton
              text={t('Clear')}
              onClick={handleClear}
              className="ml-2"
            />
          </div>
        </div>
      </Accordion>

      <Accordion
        title={t('Expense Type List')}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div className="d-flex" style={{ gap: '5px' }}>
            {colorCodingData.map(({ color, labelKey, id, filterValue }) => (
              <div
                key={id}
                onClick={() => handleFilterClick(filterValue)}
                style={{
                  cursor: 'pointer',
                  border: filterActive === filterValue ? '2px solid #333' : '2px solid transparent',
                  borderRadius: '4px',
                  padding: '1px 4px',
                }}
              >
                <ColorCodingSearch color={color} label={labelKey} cursor="pointer" />
              </div>
            ))}
          </div>
        }
      >
        <div>
          {isLoading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm" />
            </div>
          ) : (
            <Tables>
              <thead>
                <tr>
                  <th>{t('Sr No')}</th>
                  <th>{t('Expense Type')}</th>
                  <th>{t('Ledger No')}</th>
                  <th>{t('Created By')}</th>
                  <th>{t('Created Date')}</th>
                  {/* <th>{t('Status')}</th> */}
                  <th>{t('Action')}</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr
                    key={row.ExpenseTypeID}
                    className={row.IsActive == 0 ? 'table-danger' : ''}
                  >
                    <td data-title="Sr No">{page * RPP + i + 1}</td>
                    <td data-title="Expense Type" style={{ fontWeight: 600 }}>{row.ExpenseTypeName}</td>
                    <td data-title="Ledger No"><span className="pc-code-chip">{row.LedgerNo}</span></td>
                    <td data-title="Created By">{row.CreatedBy}</td>
                    <td data-title="Created Date">{row.CreatedDate}</td>
                    {/* <td data-title="Status">
                      <StatusBadge status={row.IsActive === 1 ? 'Active' : 'In Active'} />
                    </td> */}
                    <td data-title="Action">
                      <EditButton  onClick={() => openEdit(row)} />
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-3">
                      {t('No records found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Tables>
          )}

          <div className="pc-pagination">
            <span>
              {t('Showing')} {filteredRows.length === 0 ? 0 : page * RPP + 1}–{Math.min((page + 1) * RPP, filteredRows.length)} {t('of')} {filteredRows.length}
            </span>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹ {t('Prev')}
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('Next')} ›
              </button>
            </div>
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default ExpenseTypeMaster;
