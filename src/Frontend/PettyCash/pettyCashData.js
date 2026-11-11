export const CENTRES = [
  { id: 1, code: 'CTR001', name: 'Main Lab - Delhi' },
  { id: 2, code: 'CTR002', name: 'Noida Centre' },
  { id: 3, code: 'CTR003', name: 'Gurgaon Centre' },
  { id: 4, code: 'CTR004', name: 'Faridabad Centre' },
  { id: 5, code: 'CTR005', name: 'Ghaziabad Centre' },
];

export const EXPENSE_TYPES = [
  { id: 1, name: 'Stationery',      ledgerNo: 'LED001', createdBy: 'Admin Kumar',  createdDate: '2024-01-10', status: 'Active'    },
  { id: 2, name: 'Travel',          ledgerNo: 'LED002', createdBy: 'Admin Kumar',  createdDate: '2024-01-10', status: 'Active'    },
  { id: 3, name: 'Food & Beverage', ledgerNo: 'LED003', createdBy: 'Priya Sharma', createdDate: '2024-01-12', status: 'Active'    },
  { id: 4, name: 'Repair & Maint.', ledgerNo: 'LED004', createdBy: 'Admin Kumar',  createdDate: '2024-01-15', status: 'Active'    },
  { id: 5, name: 'Electricity',     ledgerNo: 'LED005', createdBy: 'Ravi Singh',   createdDate: '2024-02-01', status: 'Active'    },
  { id: 6, name: 'Courier',         ledgerNo: 'LED006', createdBy: 'Priya Sharma', createdDate: '2024-02-05', status: 'Active'    },
  { id: 7, name: 'Housekeeping',    ledgerNo: 'LED007', createdBy: 'Admin Kumar',  createdDate: '2024-02-10', status: 'In-Active' },
  { id: 8, name: 'Printing',        ledgerNo: 'LED008', createdBy: 'Ravi Singh',   createdDate: '2024-03-01', status: 'Active'    },
];

export const PAYMENT_MODES = ['Cash', 'NEFT', 'RTGS', 'Cheque', 'UPI', 'Card'];

export const TRANSFERS = [
  { id: 1, centreId: 2, centreName: 'Noida Centre',     centreCode: 'CTR002', paymentMode: 'NEFT', date: '2024-05-01', amount: 15000, adjustment: false, remarks: 'Monthly allocation',    approvedBy: 'Rajesh Gupta', status: 'Approved' },
  { id: 2, centreId: 3, centreName: 'Gurgaon Centre',   centreCode: 'CTR003', paymentMode: 'Cash', date: '2024-05-02', amount: 10000, adjustment: false, remarks: 'Top-up request',       approvedBy: 'Rajesh Gupta', status: 'Approved' },
  { id: 3, centreId: 4, centreName: 'Faridabad Centre', centreCode: 'CTR004', paymentMode: 'NEFT', date: '2024-05-05', amount: 8000,  adjustment: true,  remarks: 'Adjustment transfer',  approvedBy: null,           status: 'Pending'  },
  { id: 4, centreId: 2, centreName: 'Noida Centre',     centreCode: 'CTR002', paymentMode: 'UPI',  date: '2024-05-10', amount: 5000,  adjustment: false, remarks: 'Emergency top-up',     approvedBy: null,           status: 'Pending'  },
  { id: 5, centreId: 5, centreName: 'Ghaziabad Centre', centreCode: 'CTR005', paymentMode: 'RTGS', date: '2024-05-12', amount: 20000, adjustment: false, remarks: 'Quarterly allocation', approvedBy: 'Rajesh Gupta', status: 'Approved' },
];

export const CENTRE_BALANCE = [
  { centreId: 2, totalIssued: 20000, totalExpenses: 12500, pendingApproval: 2000 },
  { centreId: 3, totalIssued: 10000, totalExpenses: 7800,  pendingApproval: 500  },
  { centreId: 4, totalIssued: 8000,  totalExpenses: 8200,  pendingApproval: 300  },
  { centreId: 5, totalIssued: 20000, totalExpenses: 9000,  pendingApproval: 1200 },
];

export const ISSUE_TRANSACTIONS = [
  { id: 1, centreName: 'Noida Centre',     centreCode: 'CTR002', amount: 15000, date: '2024-05-01', createdBy: 'Priya Sharma', type: 'Transfer',    paymentMode: 'NEFT',  cardNo: '',         bank: 'HDFC',  approvedBy: 'Rajesh Gupta', approvedDate: '2024-05-02', rejectRemark: '', remark: 'Monthly allocation', status: 'Approved' },
  { id: 2, centreName: 'Noida Centre',     centreCode: 'CTR002', amount: 5000,  date: '2024-05-10', createdBy: 'Priya Sharma', type: 'Transfer',    paymentMode: 'UPI',   cardNo: '',         bank: '',      approvedBy: null,           approvedDate: null,         rejectRemark: '', remark: 'Emergency',          status: 'Pending'  },
  { id: 3, centreName: 'Gurgaon Centre',   centreCode: 'CTR003', amount: 10000, date: '2024-05-02', createdBy: 'Amit Verma',   type: 'Transfer',    paymentMode: 'Cash',  cardNo: '',         bank: '',      approvedBy: 'Rajesh Gupta', approvedDate: '2024-05-03', rejectRemark: '', remark: 'Top-up',             status: 'Approved' },
  { id: 4, centreName: 'Faridabad Centre', centreCode: 'CTR004', amount: 8000,  date: '2024-05-05', createdBy: 'Sunita Rao',   type: 'Adjustment',  paymentMode: 'NEFT',  cardNo: '',         bank: 'SBI',   approvedBy: null,           approvedDate: null,         rejectRemark: '', remark: 'Adjustment',         status: 'Pending'  },
  { id: 5, centreName: 'Ghaziabad Centre', centreCode: 'CTR005', amount: 20000, date: '2024-05-12', createdBy: 'Kiran Das',    type: 'Transfer',    paymentMode: 'RTGS',  cardNo: '',         bank: 'ICICI', approvedBy: 'Rajesh Gupta', approvedDate: '2024-05-13', rejectRemark: '', remark: 'Quarterly',          status: 'Approved' },
  { id: 6, centreName: 'Noida Centre',     centreCode: 'CTR002', amount: 2000,  date: '2024-05-15', createdBy: 'Priya Sharma', type: 'Transfer',    paymentMode: 'Card',  cardNo: 'XXXX4521', bank: 'HDFC',  approvedBy: null,           approvedDate: null,         rejectRemark: 'Exceeded limit', remark: 'Misc', status: 'Rejected' },
];

export const EXPENSE_RECORDS = [
  { id: 1, centreName: 'Noida Centre',     centreCode: 'CTR002', amount: 450,  date: '2024-05-03', createdBy: 'Priya Sharma', expenseType: 'Stationery',      paymentMode: 'Cash',  invoiceNo: 'INV-001', invoiceDate: '2024-05-03', bank: '',      cardNo: '',         approvedBy: 'Rajesh Gupta', approvedDate: '2024-05-04', receipt: true,  narration: 'A4 paper & pens',      status: 'Approved' },
  { id: 2, centreName: 'Noida Centre',     centreCode: 'CTR002', amount: 1200, date: '2024-05-05', createdBy: 'Priya Sharma', expenseType: 'Travel',          paymentMode: 'Cash',  invoiceNo: 'INV-002', invoiceDate: '2024-05-05', bank: '',      cardNo: '',         approvedBy: 'Rajesh Gupta', approvedDate: '2024-05-06', receipt: true,  narration: 'Cab reimbursement',    status: 'Approved' },
  { id: 3, centreName: 'Gurgaon Centre',   centreCode: 'CTR003', amount: 800,  date: '2024-05-04', createdBy: 'Amit Verma',   expenseType: 'Food & Beverage', paymentMode: 'UPI',   invoiceNo: 'INV-003', invoiceDate: '2024-05-04', bank: '',      cardNo: '',         approvedBy: null,           approvedDate: null,         receipt: false, narration: 'Team lunch',           status: 'Pending'  },
  { id: 4, centreName: 'Faridabad Centre', centreCode: 'CTR004', amount: 3500, date: '2024-05-07', createdBy: 'Sunita Rao',   expenseType: 'Repair & Maint.', paymentMode: 'NEFT',  invoiceNo: 'INV-004', invoiceDate: '2024-05-07', bank: 'SBI',   cardNo: '',         approvedBy: null,           approvedDate: null,         receipt: true,  narration: 'AC repair',            status: 'Pending'  },
  { id: 5, centreName: 'Ghaziabad Centre', centreCode: 'CTR005', amount: 2200, date: '2024-05-13', createdBy: 'Kiran Das',    expenseType: 'Electricity',     paymentMode: 'NEFT',  invoiceNo: 'INV-005', invoiceDate: '2024-05-12', bank: 'ICICI', cardNo: '',         approvedBy: 'Rajesh Gupta', approvedDate: '2024-05-14', receipt: true,  narration: 'Electricity bill',     status: 'Approved' },
  { id: 6, centreName: 'Noida Centre',     centreCode: 'CTR002', amount: 650,  date: '2024-05-10', createdBy: 'Priya Sharma', expenseType: 'Printing',        paymentMode: 'Cash',  invoiceNo: 'INV-006', invoiceDate: '2024-05-10', bank: '',      cardNo: '',         approvedBy: null,           approvedDate: null,         receipt: true,  narration: 'Letterheads',          status: 'Pending'  },
  { id: 7, centreName: 'Gurgaon Centre',   centreCode: 'CTR003', amount: 900,  date: '2024-05-08', createdBy: 'Amit Verma',   expenseType: 'Courier',         paymentMode: 'Cash',  invoiceNo: 'INV-007', invoiceDate: '2024-05-08', bank: '',      cardNo: '',         approvedBy: null,           approvedDate: null,         receipt: false, narration: 'Courier charges',      status: 'Rejected' },
];

export const LEDGER_ENTRIES = [
  { id: 1,  centreName: 'Noida Centre',     centreCode: 'CTR002', amountReceived: 15000, amountPaid: 450,  approvedDate: '2024-05-04', txnType: 'Expense'  },
  { id: 2,  centreName: 'Noida Centre',     centreCode: 'CTR002', amountReceived: 0,     amountPaid: 1200, approvedDate: '2024-05-06', txnType: 'Expense'  },
  { id: 3,  centreName: 'Gurgaon Centre',   centreCode: 'CTR003', amountReceived: 10000, amountPaid: 0,    approvedDate: '2024-05-03', txnType: 'Transfer' },
  { id: 4,  centreName: 'Gurgaon Centre',   centreCode: 'CTR003', amountReceived: 0,     amountPaid: 800,  approvedDate: '2024-05-05', txnType: 'Expense'  },
  { id: 5,  centreName: 'Faridabad Centre', centreCode: 'CTR004', amountReceived: 8000,  amountPaid: 0,    approvedDate: '2024-05-06', txnType: 'Transfer' },
  { id: 6,  centreName: 'Faridabad Centre', centreCode: 'CTR004', amountReceived: 0,     amountPaid: 3500, approvedDate: '2024-05-08', txnType: 'Expense'  },
  { id: 7,  centreName: 'Ghaziabad Centre', centreCode: 'CTR005', amountReceived: 20000, amountPaid: 0,    approvedDate: '2024-05-13', txnType: 'Transfer' },
  { id: 8,  centreName: 'Ghaziabad Centre', centreCode: 'CTR005', amountReceived: 0,     amountPaid: 2200, approvedDate: '2024-05-14', txnType: 'Expense'  },
  { id: 9,  centreName: 'Noida Centre',     centreCode: 'CTR002', amountReceived: 5000,  amountPaid: 0,    approvedDate: '2024-05-11', txnType: 'Transfer' },
  { id: 10, centreName: 'Noida Centre',     centreCode: 'CTR002', amountReceived: 0,     amountPaid: 650,  approvedDate: '2024-05-11', txnType: 'Expense'  },
];

export const REJECTED_RECORDS = [
  { id: 1, type: 'Issue',   centreName: 'Noida Centre',     centreCode: 'CTR002', amount: 2000, date: '2024-05-15', createdBy: 'Priya Sharma', txnType: 'Transfer', paymentMode: 'Card', invoiceNo: '',        bank: 'HDFC',  cardNo: 'XXXX4521', approvedBy: 'Rajesh Gupta', approvedDate: '2024-05-16', rejectReason: 'Exceeded limit'     },
  { id: 2, type: 'Expense', centreName: 'Gurgaon Centre',   centreCode: 'CTR003', amount: 900,  date: '2024-05-08', createdBy: 'Amit Verma',   txnType: 'Expense',  paymentMode: 'Cash', invoiceNo: 'INV-007', bank: '',       cardNo: '',         approvedBy: 'Rajesh Gupta', approvedDate: '2024-05-09', rejectReason: 'No receipt attached' },
  { id: 3, type: 'Expense', centreName: 'Faridabad Centre', centreCode: 'CTR004', amount: 1500, date: '2024-05-06', createdBy: 'Sunita Rao',   txnType: 'Expense',  paymentMode: 'Cash', invoiceNo: 'INV-010', bank: '',       cardNo: '',         approvedBy: 'Rajesh Gupta', approvedDate: '2024-05-07', rejectReason: 'Duplicate claim'    },
];

export const STATUS_COLORS = {
  Approved:    { bg: '#E8F5E9', color: '#2E7D32' },
  Pending:     { bg: '#FFF3E0', color: '#E65100' },
  Rejected:    { bg: '#FFEBEE', color: '#C62828' },
  Active:      { bg: '#E3F2FD', color: '#1565C0' },
  'In-Active': { bg: '#F5F5F5', color: '#616161' },
};
