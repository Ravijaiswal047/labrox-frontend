import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Accordion from '../components/UI/Accordion';
import ReactSelect from '../components/formComponent/ReactSelect';
import DatePicker from '../components/formComponent/DatePicker';
import { CustomButton, SearchButton } from '../components/UI/CustomButton';
import { axiosInstance } from '../utils/axiosInstance';
import MultiSelectComp from '../components/formComponent/MultiSelectComp';
import { toast } from 'react-toastify';
import ColorCodingSearch from '../components/ModalComponent/ColorCodingSearch';
import Input from '../components/formComponent/Input';
import Tables from '../components/UI/customTable';
import NoRecordFound from '../components/formComponent/NoRecordFound';
import { Dialog } from 'primereact/dialog';
import { useLocalStorage } from '../utils/hooks/useLocalStorage';
import CodeMirror from "@uiw/react-codemirror";
import { formatStandardDate } from '../utils/helpers';
import Pagination from '../Pagination/Pagination';
import './ApisDashboard.css';

const ApisDashboard = () => {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");
    const [vendors, setVendors] = useState([]);
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const [formData, setFormData] = useState({
        fromDate: new Date(),
        toDate: new Date(),
        vendor: [],
        api: []
    })
    const [modalData, setModalData] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(50);


    const colorCodingData = [
        { color: "#28a745", id: "1", labelKey: "Success", icon: "bi bi-check-circle-fill" },
        { color: "#dc3545", id: "-1", labelKey: "Failed", icon: "bi bi-x-circle-fill" },
        { color: "#ffc107", id: "0", labelKey: "Pending", icon: "bi bi-clock-fill" },
    ];

    const fetchVendors = async () => {
        try {
            const res = await axiosInstance.get("StoreD/GetVendor?IsActive=1");
            if (res.data?.success && Array.isArray(res.data?.message)) {
                const options = res.data.message.map((item) => ({
                    value: item.ID,
                    label: item.InterfaceCompanyName
                }))
                setVendors(options);
            }
        } catch (error) {
            console.error("Error fetching vendors:", error);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchApis = async () => {
        try {
            const response = await axiosInstance.get("StoreD/GetCompanyApiAvailable?IsActive=1");
            if (response.data?.success && Array.isArray(response.data?.message)) {
                const options = response.data.message.map((item) => ({
                    value: item.ID,
                    label: item.APIName
                }))
                setApis(options);
            }
        } catch (error) {
            console.error("Error fetching apis:", error);
        }
    };

    useEffect(() => {
        fetchVendors();
        fetchApis();
    }, []);

    const handleMultiSelectChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleDateChange = (value, name) => {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSearch = async () => {
        const finalPayload = {
            fromDate: formatStandardDate(formData.fromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(formData.toDate, "YYYY-MM-DD"),
            apiId: formData.api,
            vendorId: formData.vendor,
        }
        try {
            setLoading(true);
            setSelectedStatus(null);
            setCurrentPage(1);
            const res = await axiosInstance.post("StoreD/GetCompanyApiIntegrationData", finalPayload);
            if (res.data?.success && Array.isArray(res.data?.message)) {
                setTableData(res.data.message);
            } else {
                toast.error(res.data?.message || "No Data Found");
                setTableData([]);
            }
        } catch (error) {
            console.log("Error while fetching data", error);
            setTableData([]);
        } finally {
            setLoading(false);
        }
    }

    const filteredData = tableData?.filter((item) => {
        const matchesSearch = item?.APIName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            item?.InterfaceCompanyName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            item?.Method?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            item?.URL_AWSKey?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            item?.PayLoad_AWSKey?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            item?.Response_AWSKey?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            item?.dtEntry?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            item?.CreatedByName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            item?.dtUpdated?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            item?.UpdatedByName?.toLowerCase()?.includes(searchTerm?.toLowerCase());

        const matchesStatus = selectedStatus === null || String(item?.IsSuccess) === String(selectedStatus);

        return matchesSearch && matchesStatus;
    });

    const indexOfLastRecord = currentPage * pageSize;
    const indexOfFirstRecord = indexOfLastRecord - pageSize;
    const currentTableData = filteredData?.slice(indexOfFirstRecord, indexOfLastRecord);

    const statusCounts = colorCodingData.reduce((acc, { id }) => {
        acc[id] = tableData?.filter((item) => String(item?.IsSuccess) === String(id))?.length || 0;
        return acc;
    }, {});

    const handleViewKey = async (key) => {
        if (!key) {
            toast.error("No Key Found");
            return;
        }
        try {
            const res = await axiosInstance.post(`StoreD/GetTxtFileData`, {
                key: key
            });
            if (res.data?.success) {
                let message = res.data.message;
                if (typeof message === 'object' && message !== null) {
                    setModalData(JSON.stringify(message, null, 2));
                } else if (typeof message === 'string') {
                    try {
                        // Check if it's potentially a JSON string
                        const trimmed = message.trim();
                        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                            const parsed = JSON.parse(trimmed);
                            setModalData(JSON.stringify(parsed, null, 2));
                        } else {
                            setModalData(message);
                        }
                    } catch (e) {
                        setModalData(message);
                    }
                } else {
                    setModalData(String(message));
                }
                setOpenModal(true);
            } else {
                toast.error(res.data?.message || "No Data Found");
            }
        } catch (error) {
            console.log("Error while fetching data", error);
        }
    }

    return (
        <>
            <div>
                <Accordion
                    name={t("API's Dashboard")}
                    defaultValue={true}
                    isBreadcrumb={true}
                >
                    <div className="row pt-2 pl-2 pr-2 apis-filter-row">
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <DatePicker
                                name="fromDate"
                                id="fromDate"
                                lable={t("FromDate")}
                                value={formData.fromDate}
                                onChange={handleDateChange}
                                className="custom-calendar"
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <DatePicker
                                name="toDate"
                                id="toDate"
                                lable={t("ToDate")}
                                value={formData.toDate}
                                onChange={handleDateChange}
                                 className="custom-calendar"
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <MultiSelectComp
                                label="All Vendor"
                                options={vendors}
                                value={formData.vendor}
                                name="vendor"
                                id="vendor"
                                onChange={handleMultiSelectChange}
                                lable={t("Select Vendor")}
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <MultiSelectComp
                                label="All API"
                                options={apis}
                                value={formData.api}
                                name="api"
                                id="api"
                                onChange={handleMultiSelectChange}
                                lable={t("Select API")}
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 my-1 d-flex apis-action-buttons" style={{ gap: "8px" }}>
                            <div className="flex-fill">
                                <SearchButton
                                    text={t("Search")}
                                     loading={loading}
                            disabled={loading}
                                    onClick={handleSearch}
                                    className="w-100"
                                />
                            </div>
                            <div className="flex-fill">
                                <CustomButton
                                    text={t("Excel")}
                                    icon={"excel"}
                                    onClick={() => { }}
                                    className="w-100"
                                />
                            </div>
                        </div>
                    </div>
                </Accordion>
                <Accordion
                    className="apis-search-accordion"
                    name={t("Search Data")}
                    defaultValue={true}
                    isBreadcrumb={true}
                    notOpen={true}
                    linkTo="#"
                    linkTitle={
                        <div
                            className="d-none d-md-flex align-items-center"
                            id="pr_id_11"
                            style={{
                                gap: "10px",
                                flexWrap: "nowrap",
                                overflowX: "auto",
                                minWidth: 0,
                                maxWidth: "100%",
                                WebkitOverflowScrolling: "touch"
                            }}
                        >
                            {colorCodingData.map(({ color, labelKey, id, icon }) => (
                                <div key={id} style={{ flexShrink: 0 }}>
                                    <ColorCodingSearch
                                        color={color}
                                        label={`${t(labelKey)} (${statusCounts[id] || 0})`}
                                        icon={icon}
                                        cursor="pointer"
                                        onClick={() => {
                                            setSelectedStatus(selectedStatus === id ? null : id);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            ))}
                            <div style={{ width: "180px", flexShrink: 0 }}>
                                <Input
                                    className="mt-2"
                                    type="text"
                                    name="search"
                                    id="search"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    }
                    seconTitle={
                        <span className="badge bg-info">
                            {t("Total Records")}: {filteredData.length}
                        </span>
                    }
                >
                    {/* Mobile-only controls: rendered as normal body content (not inside the
                        header's h4/anchor, so the pills + search never fight the header's
                        flex layout or inherit the Bootstrap btn-link look) but styled with the
                        "card-header" class so it visually reads as part of the blue header bar */}
                    <div className="card-header apis-mobile-header-controls d-flex d-md-none flex-wrap align-items-center" style={{ gap: "10px", rowGap: "8px" }}>
                        {colorCodingData.map(({ color, labelKey, id, icon }) => (
                            <div key={id} style={{ flexShrink: 0 }}>
                                <ColorCodingSearch
                                    color={color}
                                    label={`${t(labelKey)} (${statusCounts[id] || 0})`}
                                    icon={icon}
                                    cursor="pointer"
                                    onClick={() => {
                                        setSelectedStatus(selectedStatus === id ? null : id);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        ))}
                        <div style={{ width: "180px", maxWidth: "100%", flexShrink: 0 }}>
                            <Input
                                className=""
                                type="text"
                                name="search-mobile"
                                id="search-mobile"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                    <div className="row px-2 mt-2 mb-2">
                        <div className="col-12">
                            {filteredData.length > 0 ? (
                                <Tables tableHeight="apis-dashboard-table">
                                    <thead className="cf">
                                        <tr>
                                            <th>{t("S.No")}</th>
                                            <th>{t("APIName")}</th>
                                            <th>{t("InterfaceCompanyName")}</th>
                                            <th>{t("Method")}</th>
                                            <th style={{ width: "150px", maxWidth: "150px" }}>{t("AWS Key")}</th>
                                            <th style={{ width: "150px", maxWidth: "150px" }}>{t("Payload AWS Key")}</th>
                                            <th style={{ width: "150px", maxWidth: "150px" }}>{t("Response AWS Key")}</th>
                                            <th>{t("CreatedAt")}</th>
                                            <th>{t("CreatedBy")}</th>
                                            <th>{t("UpdatedAt")}</th>
                                            <th>{t("UpdatedBy")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentTableData?.map((ele, index) => {
                                            const wrapStyle = {
                                                width: "150px",
                                                maxWidth: "150px",
                                                wordBreak: "break-all",
                                                whiteSpace: "normal"
                                            };

                                            const rowIconData = colorCodingData.find(c => String(c.id) === String(ele?.IsSuccess));

                                            return (
                                                <tr key={index}>
                                                     <td data-title={t("S.No")} className='d-flex' style={{gap: "5px", width: "80px",}}>
                                                        {(currentPage - 1) * pageSize + index + 1} {" "}
                                                        {rowIconData && (
                                                            <i className={`${rowIconData.icon}`} style={{ color: rowIconData.color }} title={t(rowIconData.labelKey)} />
                                                        )}
                                                    </td>
                                                    <td data-title={t("APIName")}>{ele?.APIName}</td>
                                                    <td data-title={t("InterfaceCompanyName")}>{ele?.InterfaceCompanyName}</td>
                                                    <td data-title={t("Method")}>{ele?.Method}</td>
                                                    <td data-title={t("AWS Key")} style={wrapStyle} onClick={() => handleViewKey(ele?.URL_AWSKey)} className='cursor-pointer'><i className='bi bi-eye-fill text-primary' /></td>
                                                    <td data-title={t("Payload AWS Key")} style={wrapStyle} onClick={() => handleViewKey(ele?.PayLoad_AWSKey)} className='cursor-pointer'><i className='bi bi-eye-fill text-primary' /></td>
                                                    <td data-title={t("Response AWS Key")} style={wrapStyle} onClick={() => handleViewKey(ele?.Response_AWSKey)} className='cursor-pointer'><i className='bi bi-eye-fill text-primary' /></td>
                                                    <td data-title={t("CreatedAt")}>{ele?.dtEntry}</td>
                                                    <td data-title={t("CreatedBy")}>{ele?.CreatedByName}</td>
                                                    <td data-title={t("UpdatedAt")}>{ele?.dtUpdated}</td>
                                                    <td data-title={t("UpdatedBy")}>{ele?.UpdatedByName}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Tables>
                            ) : (
                                <NoRecordFound />
                            )}
                             {/* PAGINATION */}
                                              <div className="d-flex justify-content-end align-items-center mt-2">
                                                <Pagination
                                                  className="pagination-bar"
                                                  currentPage={currentPage}
                                                  totalCount={filteredData.length}
                                                  pageSize={pageSize}
                                                  onPageChange={(page) => setCurrentPage(page)}
                                                />
                                              </div>
                        </div>
                    </div>
                </Accordion>
            </div>

            <Dialog
                visible={openModal}
                className={theme}
                header={t("View Key")}
                onHide={() => setOpenModal(false)}
                style={{
                    width: isMobile ? "90vw" : "70vw",
                }}
            >
                <div className='pt-2 pl-2 pr-2'>
                    <div style={{
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        overflow: "hidden"
                    }}>
                        <CodeMirror
                            value={modalData}
                            minHeight="200px"
                            maxHeight="500px"
                            readOnly={true}
                            theme="dark"
                        />
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default ApisDashboard