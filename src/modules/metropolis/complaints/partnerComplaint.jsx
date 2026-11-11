import "./partnerComplaints.css"
import { Dialog } from "primereact/dialog";
import Input from "../../../components/formComponent/Input";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Accordion from "../../../components/UI/Accordion";
import Tables from "../../../components/UI/customTable";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CancelButton, CustomButton, SearchButton } from "../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import TextAreaInput from "../../../components/formComponent/TextAreaInput";
import { toast } from "react-toastify";

const PartnerComplaints = () => {
    const [showDialog, setShowDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0);
    const [activeTab, setActiveTab] = useState(0);

    const [time, setTime] = useState('today')

    const theme = useLocalStorage("theme", "get");

    const [t] = useTranslation();

    const [formData, setFormData] = useState({
        serviceType: "",
        name: '',
        email: '',
        mobile: '',
        labelType: 'patient',
        vid: '',
        caseRaisedFor: '',
        srType: '',
        subSrType: '',
        description: '',
        attachments: []
    });

    const [complaintList] = useState([
        {
            id: 1,
            caseNumber: 'SR-2025-001',
            contactNumber: '9599265429',
            status: 'Open',
            recordType: 'Service Request',
            srType: 'Billing Issue',
            srSubType: 'Invoice Correction',
            createdDate: '2025-12-01 10:30 AM',
            closedDate: '-'
        },
        {
            id: 2,
            caseNumber: 'SR-2025-002',
            contactNumber: '7780235538',
            status: 'Closed',
            recordType: 'Complaint',
            srType: 'Technical Support',
            srSubType: 'Report Download',
            createdDate: '2025-11-28 02:15 PM',
            closedDate: '2025-11-30 11:45 AM'
        },
        {
            id: 3,
            caseNumber: 'SR-2025-003',
            contactNumber: '7013786789',
            status: 'Pending',
            recordType: 'Service Request',
            srType: 'Sample Collection',
            srSubType: 'Rescheduling',
            createdDate: '2025-12-03 09:20 AM',
            closedDate: '-'
        },
        {
            id: 4,
            caseNumber: 'SR-2025-004',
            contactNumber: '9603761960',
            status: 'Resolved',
            recordType: 'Complaint',
            srType: 'Quality Issue',
            srSubType: 'Report Accuracy',
            createdDate: '2025-11-25 03:45 PM',
            closedDate: '2025-11-27 10:30 AM'
        },
        {
            id: 5,
            caseNumber: 'SR-2025-005',
            contactNumber: '9876543210',
            status: 'Open',
            recordType: 'Service Request',
            srType: 'Account Management',
            srSubType: 'Profile Update',
            createdDate: '2025-12-05 01:00 PM',
            closedDate: '-'
        },
        {
            id: 6,
            caseNumber: 'SR-2025-006',
            contactNumber: '8765432109',
            status: 'Closed',
            recordType: 'Service Request',
            srType: 'Billing Issue',
            srSubType: 'Payment Query',
            createdDate: '2025-11-20 11:15 AM',
            closedDate: '2025-11-22 04:20 PM'
        },
        {
            id: 7,
            caseNumber: 'SR-2025-007',
            contactNumber: '7654321098',
            status: 'Pending',
            recordType: 'Complaint',
            srType: 'Service Delay',
            srSubType: 'Late Report',
            createdDate: '2025-12-04 08:30 AM',
            closedDate: '-'
        }
    ]);

    const handleRaiseComplaint = () => {
        setCurrentStep(0);
        setFormData({
            serviceType: '',
            name: '',
            email: '',
            mobile: '',
            labelType: 'patient',
            vid: '',
            caseRaisedFor: '',
            srType: '',
            subSrType: '',
            description: '',
            attachments: []
        });
        setActiveTab(0);
        setShowDialog(true);
    };

    const handleProceed = () => {
        if (formData.serviceType) {
            setCurrentStep(1);
            setActiveTab(0);
        } else {
            toast.error("Select Service type first!")
        }
    };

    const handleNext = () => {
        if (currentStep === 0) {
            return handleProceed();
        }

        if (activeTab < 2) {
            setActiveTab(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep === 0) {
            setShowDialog(false);
            return;
        }

        if (activeTab > 0) {
            setActiveTab(prev => prev - 1);
        } else {
            setCurrentStep(0);
        }
    };

    const isLastTab = activeTab === 2;
    const isFirstTab = activeTab === 0;

    const handleSubmit = () => {
        console.log('Submitting complaint:', {
            formData: formData
        });
        setShowDialog(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTimeSelectChange = (name, option) => {
        setTime(option?.value);
    };
    const handleReactSelectChange = (name, option) => {
        setFormData(option?.value);
    };

    const filteredComplaints = complaintList.filter(complaint =>
        complaint.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const timeOptions = [
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "This Week", value: "this-week" },
        { label: "Last 7 Days", value: "7d" },
    ]

    const caseRaisedForOptions = [
        { label: "Billing Issue", value: "billing" },
        { label: "Technical Support", value: "technical" },
        { label: "Sample Collection", value: "sample" },
        { label: "Quality Issue", value: "quality" },
    ];

    const srTypeOptions = [
        { label: "Invoice Correction", value: "invoice" },
        { label: "Report Download", value: "report" },
        { label: "Rescheduling", value: "reschedule" },
        { label: "Report Accuracy", value: "accuracy" },
    ];

    const subSrTypeOptions = [
        { label: "Urgent", value: "urgent" },
        { label: "Normal", value: "normal" },
        { label: "Low Priority", value: "low" },
    ];


    return (
        <>
            <Accordion
                name={t("Partner Staff List")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="header-section">
                    <div className="d-flex" style={{gap: "5px"}}>
                        <div className="col-12 col-sm-12">
                            <ReactSelect
                                dynamicOptions={timeOptions}
                                name="time"
                                lable={t("Select time")}
                                id="time"
                                removeIsClearable={true}
                                placeholderName={t("Select Time")}
                                value={time}
                                onChange={handleTimeSelectChange}
                                isDisabled={loading || timeOptions.length === 0}
                            />
                        </div>
                        <CustomButton
                            text={"Go"}
                        />
                    </div>
                    <div className="d-flex flex-column flex-sm-row align-items-center" style={{ gap: "5px" }}>
                        <div className="search-section">
                            <Input
                                type="text"
                                lable={"Search"}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <SearchButton
                                text={"Search"}
                            />
                        </div>
                        <div style={{ marginBottom: "0.4rem" }}>
                            <CustomButton
                                icon={"add"}
                                text={"Raise Complaint"}
                                onClick={handleRaiseComplaint}
                            />
                        </div>
                    </div>
                </div>

                <Tables className="staff-table">
                    <thead>
                        <tr>
                            <th>Case Number</th>
                            <th>Contact Number</th>
                            <th>Status</th>
                            <th>Record Type</th>
                            <th>SR Type</th>
                            <th>SR Sub Type</th>
                            <th>Created Date/Time</th>
                            <th>Closed Date/Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredComplaints.map((complaint) => (
                            <tr key={complaint.id}>
                                <td data-title={t("Case Number")}>{`${complaint.caseNumber}`}</td>
                                <td data-title={t("Contact Number")}>{complaint.contactNumber}</td>
                                <td data-title={t("Status")}>{complaint.status}</td>
                                <td data-title={t("Record Type")}>{complaint.recordType}</td>
                                <td data-title={t("SR Type")}>{complaint.srType}</td>
                                <td data-title={t("SR Sub Type")}>{complaint.srSubType}</td>
                                <td data-title={t("Created Date/Time")}>{complaint.createdDate}</td>
                                <td data-title={t("Closed Date/Time")}>{complaint.closedDate}</td>

                            </tr>
                        ))}
                    </tbody>
                </Tables>
            </Accordion>

            <Dialog
                header={currentStep === 0 
                    ? "Select Complaint Type" 
                    : formData.serviceType === 'serviceRequest' 
                    ? `New Case: SR-Request` 
                    : `New Case: SR-Complaint`
                }
                onHide={() => setShowDialog(false)}
                className={theme}
                visible={showDialog}
                style={{ width: '70vw' }}
            >
                {currentStep === 0 ? (
                    // Step 0: Complaint Type Selection
                    <div className="row pt-3 px-2 py-3">
                        <div className="col-12 mb-4">
                            <div className="d-flex align-items-center mb-3">
                                <input
                                    type="radio"
                                    id="serviceRequest"
                                    name="serviceType"
                                    checked={formData.serviceType === 'serviceRequest'}
                                    onChange={() => setFormData({
                                        ...formData,
                                        serviceType: 'serviceRequest'
                                    })}
                                    className="mr-2"
                                />
                                <label htmlFor="serviceRequest" className="mb-0">Service Request</label>
                            </div>
                            <div className="d-flex align-items-center">
                                <input
                                    type="radio"
                                    id="serviceComplaint"
                                    name='serviceType'
                                    checked={formData.serviceType === 'serviceComplaint'}
                                    onChange={() => setFormData({
                                        ...formData,
                                        serviceType: 'serviceComplaint'
                                    })}
                                    className="mr-2"
                                />
                                <label htmlFor="serviceComplaint" className="mb-0">Service Complaint</label>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="dialog-footer">
                                <CancelButton
                                    text="Cancel"
                                    className="mr-2"
                                    onClick={() => setShowDialog(false)}
                                />
                                <CustomButton
                                    onClick={handleProceed}
                                    text="Proceed"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Step 1: Form with Tabs
                    <>
                        <div className="tabs-container mb-3">
                            <ul className="nav nav-tabs" style={{ gap: "5px" }}>
                                <li className="nav-item">
                                    <CustomButton
                                        text={"Case Information"}
                                        className={`nav-link ${activeTab === 0 ? 'active' : ''}`}
                                        onClick={() => setActiveTab(0)}
                                    />
                                </li>
                                <li className="nav-item">
                                    <CustomButton
                                        text={"Case Description"}
                                        className={`nav-link ${activeTab === 1 ? 'active' : ''}`}
                                        onClick={() => setActiveTab(1)}
                                    />
                                </li>
                                <li className="nav-item">
                                    <CustomButton
                                        text={"Add Attachment"}
                                        className={`nav-link ${activeTab === 2 ? 'active' : ''}`}
                                        onClick={() => setActiveTab(2)}
                                    />
                                </li>
                            </ul>
                        </div>

                        <div className="tab-content">
                            {activeTab === 0 && (
                                <div className="row">
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="fw-bold mb-0">Name: </h5>
                                            <p className="text-muted mb-0">AMRITAA DIAGNOSTICS PRIVATE LIMITED</p>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="mb-0">Client Code</h5>
                                            <p className="mb-0">CUS11037</p>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="mb-0">Mobile</h5>
                                            <p className="mb-0">9097984984</p>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="mb-0">Email</h5>
                                            <p className="mb-0">ravi.g@amritaadiagnostics.com</p>
                                        </div >
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="mb-0">Location</h5>
                                            <p className="mb-0">Vijayawada (Urban)</p>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label">Select Label Type</label>
                                        <div className="d-flex flex-column gap-3 mt-2">
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="radio"
                                                    id="patientLabel"
                                                    name="labelType"
                                                    value="patient"
                                                    checked={formData.labelType === 'patient'}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                <label htmlFor="patientLabel" className="mb-0">Patient Label</label>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="radio"
                                                    id="clientLabel"
                                                    name="labelType"
                                                    value="client"
                                                    checked={formData.labelType === 'client'}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                <label htmlFor="clientLabel" className="mb-0">Client Label</label>
                                            </div>
                                        </div>
                                        {formData.labelType === 'patient' && (
                                            <div className="mt-3">
                                                <Input
                                                    type="text"
                                                    name="vid"
                                                    value={formData.vid}
                                                    onChange={handleChange}
                                                    lable="Enter VID"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Case Description */}
                            {activeTab === 1 && (
                                <div className="row pt-2 px-2">
                                    <div className="col-12 col-sm-6">
                                        <ReactSelect
                                            dynamicOptions={caseRaisedForOptions}
                                            name="caseRaisedFor"
                                            lable="Case Raised For"
                                            id="caseRaisedFor"
                                            removeIsClearable={true}
                                            placeholderName="Select"
                                            value={formData.caseRaisedFor}
                                            onChange={handleReactSelectChange}
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <ReactSelect
                                            dynamicOptions={srTypeOptions}
                                            name="srType"
                                            lable="SR Type"
                                            id="srType"
                                            removeIsClearable={true}
                                            placeholderName="Select SR Type"
                                            value={formData.srType}
                                            onChange={handleReactSelectChange}
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <ReactSelect
                                            dynamicOptions={subSrTypeOptions}
                                            name="subSrType"
                                            lable="Sub SR Type"
                                            id="subSrType"
                                            removeIsClearable={true}
                                            placeholderName="Select Sub SR Type"
                                            value={formData.subSrType}
                                            onChange={handleReactSelectChange}
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <TextAreaInput
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="form-control"
                                            lable={"Description"}
                                            rows="4"
                                            placeholder="Enter case description..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Add Attachment */}
                            {activeTab === 2 && (
                                <div className="row pt-2 px-2">
                                    <div className="col-12 mb-3">
                                        <label className="form-label">Upload Attachments</label>
                                        <Input
                                            type="file"
                                            className="form-control"
                                            multiple
                                        // onChange={handleFileUpload}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="dialog-footer mt-3">
                            <CustomButton
                               text={"Previous"}
                               icon={"back"}
                                onClick={handleBack}
                                className="mr-2"
                            />
                            <CustomButton
                                onClick={handleNext}
                                text={isLastTab ? "Save" : "Save & Next"}
                                icon="save"
                            />
                        </div>
                    </>
                )}
            </Dialog>
        </>
    );
};

export default PartnerComplaints;